export const appName = 'Stacklore';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'Vito28',
  repo: 'Stackalore',
  branch: 'main',
};

export const repoUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

/** Link to a file in the repository on GitHub, e.g. `repoFileUrl('LICENSE')`. */
export function repoFileUrl(path: string): string {
  return `${repoUrl}/blob/${gitConfig.branch}/${path}`;
}
