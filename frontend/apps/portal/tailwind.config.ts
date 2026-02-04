import type { Config } from 'tailwindcss';
import baseConfig from '@loyalty/config/tailwind/base';

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: { extend: { ...baseConfig.theme?.extend } },
};
export default config;
