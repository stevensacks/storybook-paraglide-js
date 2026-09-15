import type {Renderer, StoryContext} from 'storybook/internal/types';
import type {ParaglideParameters, ParaglideRuntime} from './types';

const missingParameter = `The 'paraglide' parameter is missing in 'parameters' configuration of preview.js. Define the 'paraglide' parameter as follows:
import * as runtime from '../src/paraglide/runtime';

parameters: {
    paraglide: {runtime},
},
`;

const logged = new Set<string>();

/*
 The locale is resolved twice per render - once by the loader, once by the
 decorator - so an unchanged misconfiguration would otherwise log the same line
 twice on every render, forever.
*/
const logOnce = (level: 'error' | 'warn', message: string) => {
    if (logged.has(message)) return;

    logged.add(message);
    console[level](message);
};

const isKnownLocale = (runtime: ParaglideRuntime, locale: string) =>
    runtime.isLocale
        ? runtime.isLocale(locale)
        : runtime.locales.includes(locale);

export type ResolvedLocale = {
    locale: string;
    paraglide: ParaglideParameters;
    runtime: ParaglideRuntime;
};

/**
 * The locale the story should render in: the `locale` global, or the runtime's
 * base locale when that global is unset or was not compiled into the project.
 *
 * Returns `undefined` when the project has no `paraglide` parameter, in which
 * case there is nothing this addon can do.
 */
export const resolveLocale = (
    context: StoryContext<Renderer>,
): ResolvedLocale | undefined => {
    const paraglide = context.parameters.paraglide as
        ParaglideParameters | undefined;

    if (paraglide?.runtime === undefined) {
        logOnce('error', missingParameter);

        return undefined;
    }

    const {runtime} = paraglide;

    const requested = (context.globals.locale as string) || runtime.baseLocale;

    if (!isKnownLocale(runtime, requested)) {
        logOnce(
            'warn',
            `storybook-paraglide-js: '${requested}' is not one of the locales compiled into your Paraglide project (${runtime.locales.join(', ')}). Falling back to '${runtime.baseLocale}'.`,
        );

        return {locale: runtime.baseLocale, paraglide, runtime};
    }

    return {locale: requested, paraglide, runtime};
};
