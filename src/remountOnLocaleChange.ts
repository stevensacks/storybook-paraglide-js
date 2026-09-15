import {addons} from 'storybook/preview-api';
import {FORCE_REMOUNT} from 'storybook/internal/core-events';
import type {Renderer, StoryContext} from 'storybook/internal/types';
import {resolveLocale} from './locale';

/*
 Deliberately module scope, not a hook.

 Emitting FORCE_REMOUNT tears down the story's hooks context, so hook state
 cannot be used to remember which locale we already applied - the fresh mount
 would see a reset value, emit again, and loop forever. This survives teardown.
*/
let appliedLocale: string | undefined;

/**
 * Remount the story whenever the locale changes, so it starts from a clean
 * slate instead of keeping the state the previous locale left behind.
 *
 * This is a loader rather than an effect on purpose. Loaders run in the first
 * phase of a render, before the story mounts and before the play function;
 * Storybook's `useEffect` runs on STORY_RENDERED, which is after both. Asking
 * for the remount from an effect therefore let the old mount re-render under
 * the new locale and run the play function against state the previous run had
 * left in it, and only then tore it down. Emitting here aborts that render
 * before anything is painted, so a locale change produces exactly one render:
 * the fresh mount, whose play function starts from initial state.
 *
 * A re-render alone is not enough: it is fine for components that call `m.*`
 * while rendering, but not for ones that cache strings in state or a memo.
 * FORCE_REMOUNT is renderer agnostic, unlike resetting a React key.
 */
export const remountOnLocaleChange = (context: StoryContext<Renderer>) => {
    const resolved = resolveLocale(context);

    if (resolved === undefined) return;

    const {locale} = resolved;
    const changed = appliedLocale !== undefined && appliedLocale !== locale;

    // Recorded before emitting, so the remount's own render is not seen as
    // another change and does not loop.
    appliedLocale = locale;

    if (changed && addons.hasChannel()) {
        addons.getChannel().emit(FORCE_REMOUNT, {storyId: context.id});
    }
};
