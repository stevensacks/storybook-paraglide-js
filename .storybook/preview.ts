import {definePreview} from '@storybook/react-vite';
import * as runtime from '../src/paraglide/runtime';

export default definePreview({
    initialGlobals: {
        locale: 'en',
        locales: {
            en: {icon: '🇺🇸', title: 'English', right: 'EN'},
            fr: {icon: '🇫🇷', title: 'Français', right: 'FR'},
            ja: {icon: '🇯🇵', title: '日本語', right: 'JP'},
            ar: {icon: '🇸🇦', title: 'العربية', right: 'AR'},
        },
    },
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        paraglide: {runtime},
    },
});
