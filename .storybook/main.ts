import {defineMain} from '@storybook/react-vite/node';

const config = defineMain({
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [import.meta.resolve('./local-preset.js')],
    framework: '@storybook/react-vite',
});

export default config;
