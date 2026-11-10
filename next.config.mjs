import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      // "Program Pertama & Output" and "Input dengan cin" were merged into one lesson.
      { source: '/docs/cpp/program-pertama', destination: '/docs/cpp/input-dan-output', permanent: true },
      {
        source: '/docs/cpp/input-dengan-cin',
        destination: '/docs/cpp/input-dan-output#membaca-input',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
