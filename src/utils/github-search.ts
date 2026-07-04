import { Octokit } from '@octokit/rest';
import { addDays, differenceInCalendarDays, format } from 'date-fns';

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  merged_at: string | null;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  } | null;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
  commits?: GitHubCommit[];
}

export class GitHubSearchAPI {
  private octokit: Octokit;
  private readonly searchPerPage = 100;
  private readonly githubSearchResultLimit = 1000;
  private readonly prCommitConcurrency = 10;
  private readonly maxRateLimitRetries = 5;
  private readonly fallbackRateLimitDelayMs = 30_000;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async testConnection(repoUrl: string): Promise<boolean> {
    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);
      await this.withRateLimitRetry(() => this.octokit.repos.get({ owner, repo }));
      return true;
    } catch (error) {
      return false;
    }
  }

  async fetchPRs(
    repoUrl: string,
    headBranch: string,
    baseBranch: string,
    startDate: Date,
    endDate: Date,
    usernames: string[]
  ): Promise<GitHubPR[]> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);

    const searchItems = await this.fetchMergedPRSearchItems(
      owner,
      repo,
      headBranch,
      baseBranch,
      startDate,
      endDate
    );

    const prItemsByNumber = new Map<number, any>();
    searchItems.forEach(item => {
      if (item.pull_request && typeof item.number === 'number') {
        prItemsByNumber.set(item.number, item);
      }
    });

    const normalizedUsernames = usernames.map(username => username.toLowerCase());
    const results = await this.mapWithConcurrency(
      Array.from(prItemsByNumber.values()),
      this.prCommitConcurrency,
      item => this.fetchPRWithMatchingCommits(owner, repo, item, headBranch, baseBranch, normalizedUsernames)
    );

    const failedCount = results.filter(result => result.failed).length;
    if (failedCount > 0) {
      throw new Error(`Failed to fetch details for ${failedCount} PR(s). Please retry in a few minutes.`);
    }

    const matchedPRs = results
      .map(result => result.pr)
      .filter(pr => pr !== null) as GitHubPR[];

    return matchedPRs.sort((a, b) =>
      new Date(b.merged_at!).getTime() - new Date(a.merged_at!).getTime()
    );
  }

  private async fetchMergedPRSearchItems(
    owner: string,
    repo: string,
    headBranch: string,
    baseBranch: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const searchQuery = this.buildMergedPRSearchQuery(owner, repo, headBranch, baseBranch, startDate, endDate);
    const firstPageResponse = await this.withRateLimitRetry(() => this.octokit.search.issuesAndPullRequests({
      q: searchQuery,
      sort: 'updated',
      order: 'desc',
      per_page: this.searchPerPage,
      page: 1,
    }));

    const totalCount = firstPageResponse.data.total_count;
    const daysInRange = differenceInCalendarDays(endDate, startDate);

    if (totalCount >= this.githubSearchResultLimit && daysInRange > 0) {
      const midpoint = addDays(startDate, Math.floor(daysInRange / 2));
      const rightStart = addDays(midpoint, 1);

      const leftItems = await this.fetchMergedPRSearchItems(
        owner,
        repo,
        headBranch,
        baseBranch,
        startDate,
        midpoint
      );
      const rightItems = await this.fetchMergedPRSearchItems(
        owner,
        repo,
        headBranch,
        baseBranch,
        rightStart,
        endDate
      );

      return [...leftItems, ...rightItems];
    }

    if (totalCount >= this.githubSearchResultLimit) {
      const date = format(startDate, 'yyyy-MM-dd');
      throw new Error(`GitHub search returned ${totalCount}+ PRs for ${date}. Please narrow the analysis period.`);
    }

    const allSearchItems = [...firstPageResponse.data.items];
    const totalPages = Math.ceil(totalCount / this.searchPerPage);

    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          this.withRateLimitRetry(() => this.octokit.search.issuesAndPullRequests({
            q: searchQuery,
            sort: 'updated',
            order: 'desc',
            per_page: this.searchPerPage,
            page,
          }))
        );
      }

      const pageResponses = await Promise.all(pagePromises);
      pageResponses.forEach(response => {
        allSearchItems.push(...response.data.items);
      });
    }

    return allSearchItems;
  }

  private buildMergedPRSearchQuery(
    owner: string,
    repo: string,
    headBranch: string,
    baseBranch: string,
    startDate: Date,
    endDate: Date
  ): string {
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    let searchQuery = `repo:${owner}/${repo} is:pr is:merged base:${baseBranch} merged:${startDateStr}..${endDateStr}`;

    if (headBranch) {
      searchQuery += ` head:${headBranch}`;
    }

    return searchQuery;
  }

  private async fetchPRWithMatchingCommits(
    owner: string,
    repo: string,
    searchItem: any,
    headBranch: string,
    baseBranch: string,
    usernames: string[]
  ): Promise<{ pr: GitHubPR | null; failed: boolean }> {
    try {
      const pullNumber = searchItem.number;
      const commits = await this.fetchAllPRCommits(owner, repo, pullNumber);

      const hasMatchingCommit = commits.some(commit =>
        usernames.some(username =>
          commit.author?.login?.toLowerCase() === username ||
          commit.commit.author?.name?.toLowerCase() === username
        )
      );

      if (!hasMatchingCommit) return { pr: null, failed: false };

      return {
        failed: false,
        pr: {
          id: searchItem.id,
          number: searchItem.number,
          title: searchItem.title,
          body: searchItem.body,
          merged_at: searchItem.closed_at,
          html_url: searchItem.html_url,
          user: searchItem.user,
          head: { ref: headBranch },
          base: { ref: baseBranch },
          commits: commits.map(commit => ({
            sha: commit.sha,
            commit: {
              message: commit.commit.message,
              author: {
                name: commit.commit.author?.name || 'Unknown',
                date: commit.commit.author?.date || ''
              }
            },
            author: commit.author ? {
              login: commit.author.login,
              avatar_url: commit.author.avatar_url
            } : null,
            html_url: commit.html_url
          }))
        }
      };
    } catch (error) {
      return { pr: null, failed: true };
    }
  }

  private async fetchAllPRCommits(owner: string, repo: string, pullNumber: number): Promise<any[]> {
    const commits: any[] = [];
    let page = 1;

    while (true) {
      const response = await this.withRateLimitRetry(() => this.octokit.pulls.listCommits({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
        page,
      }));

      commits.push(...response.data);

      if (response.data.length < 100) {
        break;
      }

      page += 1;
    }

    return commits;
  }

  private async mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    mapper: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const currentIndex = nextIndex;
        nextIndex += 1;

        if (currentIndex >= items.length) {
          break;
        }

        results[currentIndex] = await mapper(items[currentIndex]);
      }
    });

    await Promise.all(workers);
    return results;
  }

  private async withRateLimitRetry<T>(request: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (!this.isRateLimitError(error) || retryCount >= this.maxRateLimitRetries) {
        throw error;
      }

      const delayMs = this.getRateLimitDelayMs(error, retryCount);
      await this.sleep(delayMs);
      return this.withRateLimitRetry(request, retryCount + 1);
    }
  }

  private isRateLimitError(error: any): boolean {
    const message = String(error?.message || '').toLowerCase();
    const headers = error?.response?.headers || {};

    return (
      error?.status === 429 ||
      headers['retry-after'] !== undefined ||
      headers['x-ratelimit-remaining'] === '0' ||
      message.includes('rate limit') ||
      message.includes('secondary rate limit') ||
      message.includes('abuse detection')
    );
  }

  private getRateLimitDelayMs(error: any, retryCount: number): number {
    const headers = error?.response?.headers || {};
    const retryAfter = Number(headers['retry-after']);

    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      return retryAfter * 1000;
    }

    const resetAtSeconds = Number(headers['x-ratelimit-reset']);
    if (Number.isFinite(resetAtSeconds) && resetAtSeconds > 0) {
      const resetDelayMs = resetAtSeconds * 1000 - Date.now() + 5000;
      if (resetDelayMs > 0) {
        return resetDelayMs;
      }
    }

    return this.fallbackRateLimitDelayMs * Math.pow(2, retryCount);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  private parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }
}