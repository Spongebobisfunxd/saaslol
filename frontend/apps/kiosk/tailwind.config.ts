import type { Config } from 'tailwindcss';
import baseConfig from '@loyalty/config/tailwind/base';

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      ...baseConfig.theme?.extend,
      minHeight: {
        'touch': '80px',
      },
      minWidth: {
        'touch': '80px',
      },
    },
  },
};
export default config;
