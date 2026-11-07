import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
      transparentMode: 'top',
    },
    themeSwitch: {
      enabled: false,
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
      },
      {
        text: 'Explore',
        url: '/#explore',
      },
      {
        text: 'Playground',
        url: '/#playground',
      },
      {
        text: 'Visualizations',
        url: '/#visualizations',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
