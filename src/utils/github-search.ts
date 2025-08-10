import { Octokit } from '@octokit/rest';
import { format } from 'date-fns';

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
}

export class GitHubSearchAPI {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async testConnection(repoUrl: string): Promise<boolean> {
    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);
      await this.octokit.repos.get({ owner, repo });
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

    // GitHub Search API를 사용해서 병합일 기준으로 검색
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    let searchQuery = `repo:${owner}/${repo} is:pr is:merged base:${baseBranch} merged:${startDateStr}..${endDateStr}`;

    if (headBranch) {
      searchQuery += ` head:${headBranch}`;
    }

    // 모든 페이지를 병렬로 가져오기
    const allSearchItems: any[] = [];
    const perPage = 100;

    // 첫 번째 페이지로 총 결과 수 확인
    const firstPageResponse = await this.octokit.search.issuesAndPullRequests({
      q: searchQuery,
      sort: 'updated',
      order: 'desc',
      per_page: perPage,
      page: 1,
    });

    allSearchItems.push(...firstPageResponse.data.items);

    // 추가 페이지가 있으면 병렬로 가져오기
    const totalPages = Math.min(Math.ceil(firstPageResponse.data.total_count / perPage), 10); // 최대 10페이지

    if (totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          this.octokit.search.issuesAndPullRequests({
            q: searchQuery,
            sort: 'updated',
            order: 'desc',
            per_page: perPage,
            page: p,
          })
        );
      }

      const pageResponses = await Promise.all(pagePromises);
      pageResponses.forEach(response => {
        allSearchItems.push(...response.data.items);
      });
    }

    // PR만 필터링
    const prItems = allSearchItems.filter(item => item.pull_request);

    // PR 상세 정보와 커밋 정보를 병렬로 가져오기
    const prPromises = prItems.map(async (item) => {
      try {
        // PR 상세 정보와 커밋 정보를 병렬로 가져오기
        const [prResponse, commitsResponse] = await Promise.all([
          this.octokit.pulls.get({
            owner,
            repo,
            pull_number: item.number
          }),
          this.octokit.pulls.listCommits({
            owner,
            repo,
            pull_number: item.number,
            per_page: 100,
          })
        ]);

        const pr = prResponse.data;
        const commits = commitsResponse.data;

        if (!pr.merged_at) return null;

        // 커밋 작성자 확인
        const hasMatchingCommit = commits.some(commit =>
          usernames.some(username =>
            commit.author?.login?.toLowerCase() === username.toLowerCase() ||
            commit.commit.author?.name?.toLowerCase() === username.toLowerCase()
          )
        );

        return hasMatchingCommit ? (pr as GitHubPR) : null;
      } catch (error) {
        return null;
      }
    });

    // 모든 PR 처리를 병렬로 실행
    const results = await Promise.all(prPromises);
    const matchedPRs = results.filter(pr => pr !== null) as GitHubPR[];

    return matchedPRs.sort((a, b) =>
      new Date(b.merged_at!).getTime() - new Date(a.merged_at!).getTime()
    );
  }

  private parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }
}