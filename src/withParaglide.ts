import type {
    PartialStoryFn as StoryFunction,
    Renderer,
    StoryContext,
} from 'storybook/internal/types';
import {resolveLocale} from './locale';
import type {ParaglideRuntime} from './types';

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
    const resolved = resolveLocale(context);

    if (resolved) {
        const {locale, paraglide, runtime} = resolved;

        // Take over locale resolution entirely, so whichever strategy the
        // project configures (url, cookie, localStorage) is bypassed here.
        runtime.overwriteGetLocale(() => locale);

        if (paraglide.setDocumentAttributes !== false) {
            applyDocumentAttributes(runtime, locale);
        }
    }

    return StoryFn(context);
};
