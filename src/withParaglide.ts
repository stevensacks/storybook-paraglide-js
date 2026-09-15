import {addons, useEffect, useGlobals} from 'storybook/preview-api';
import {FORCE_REMOUNT} from 'storybook/internal/core-events';
import type {
    PartialStoryFn as StoryFunction,
    Renderer,
    StoryContext,
} from 'storybook/internal/types';
import type {ParaglideParameters, ParaglideRuntime} from './types';

/*
 Deliberately module scope, not a hook.

 Emitting FORCE_REMOUNT tears down the story's hooks context, so hook state
 cannot be used to remember which locale we already applied - the fresh mount
 would see a reset value, emit again, and loop forever. This survives teardown.
*/
let appliedLocale: string | undefined;

const isKnownLocale = (runtime: ParaglideRuntime, locale: string) =>
    runtime.isLocale
        ? runtime.isLocale(locale)
        : runtime.locales.includes(locale);

const applyDocumentAttributes = (runtime: ParaglideRuntime, locale: string) => {
    const element = globalThis.document?.documentElement;

    if (!element) return;

    element.lang = locale;
    element.dir = runtime.getTextDirection?.(locale) ?? 'ltr';
};

export const withParaglide = (
    StoryFn: StoryFunction<Renderer>,
    context: StoryContext<Renderer>,
) => {
    const paraglide = context.parameters.paraglide as
        ParaglideParameters | undefined;

    const [{locale}] = useGlobals();

    const runtime = paraglide?.runtime;

    if (runtime === undefined) {
        console.error(`The 'paraglide' parameter is missing in 'parameters' configuration of preview.js. Define the 'paraglide' parameter as follows:
import * as runtime from '../src/paraglide/runtime';

parameters: {
    paraglide: {runtime},
},
`);
    }

    let current: string | undefined;

    if (runtime) {
        let applied: string = locale || runtime.baseLocale;

        if (!isKnownLocale(runtime, applied)) {
            console.warn(
                `storybook-paraglide-js: '${applied}' is not one of the locales compiled into your Paraglide project (${runtime.locales.join(', ')}). Falling back to '${runtime.baseLocale}'.`,
            );
            applied = runtime.baseLocale;
        }

        // Take over locale resolution entirely, so whichever strategy the
        // project configures (url, cookie, localStorage) is bypassed here.
        runtime.overwriteGetLocale(() => applied);

        if (paraglide.setDocumentAttributes !== false) {
            applyDocumentAttributes(runtime, applied);
        }

        current = applied;
    }

    useEffect(() => {
        if (appliedLocale !== undefined && appliedLocale !== current) {
            // A re-render is enough for components that call m.* while
            // rendering, but not for ones that cache strings in state or a
            // memo, so remount the story instead. Renderer agnostic.
            if (addons.hasChannel()) {
                addons.getChannel().emit(FORCE_REMOUNT, {storyId: context.id});
            }
        }

        appliedLocale = current;
    }, [current]);

    return StoryFn(context);
};
