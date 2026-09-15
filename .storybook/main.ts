import {defineMain} from '@storybook/react-vite/node';
import {paraglideVitePlugin} from '@inlang/paraglide-js';
import {mergeConfig} from 'vite';

const config = defineMain({
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [import.meta.resolve('./local-preset.js')],
    framework: '@storybook/react-vite',
    viteFinal: (config) =>
        mergeConfig(config, {
            plugins: [
                paraglideVitePlugin({
                    project: './project.inlang',
                    outdir: './src/paraglide',
                    strategy: ['globalVariable', 'baseLocale'],
                }),
            ],
        }),
});

export default config;
