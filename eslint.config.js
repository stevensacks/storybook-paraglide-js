import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import storybook from 'eslint-plugin-storybook';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'storybook-static/**',
            'src/paraglide/**',
            'project.inlang/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...storybook.configs['flat/recommended'],
    prettier,
    {
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
    {
        // zx scripts run with zx's globals injected.
        files: ['scripts/**/*.js'],
        languageOptions: {
            globals: {
                $: 'readonly',
                chalk: 'readonly',
                console: 'readonly',
                fs: 'readonly',
                path: 'readonly',
                process: 'readonly',
            },
        },
    },
);
