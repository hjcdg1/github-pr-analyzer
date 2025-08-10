import { GitHubPR } from '../utils/github-search';

export interface Settings {
  githubToken?: string;
  theme: 'system' | 'light' | 'dark';
}

export interface TabData {
  id: string;
  name: string;
  repoUrl: string;
  headBranch: string;
  baseBranch: string;
  startDate: Date | null;
  endDate: Date | null;
  usernames: string[];
  prs?: GitHubPR[];
  loading?: boolean;
  error?: string;
}