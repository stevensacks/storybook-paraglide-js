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
 * Remount the story whenever the locale changes, so components that captured
 * the previous locale's strings in state or a memo are rebuilt.
 *
 * A re-render alone is not enough: it is fine for components that call `m.*`
 * while rendering, but not for ones that cache what `m.*` returned.
 * FORCE_REMOUNT is renderer agnostic, unlike resetting a React key.
 *
 * This is a loader rather than an effect on purpose. Loaders run in the first
 * phase of a render, before the story mounts; Storybook fires decorator
 * effects from its STORY_RENDERED listener, in the `completed` phase. Asking
 * for the remount from an effect cost an extra render per locale change: the
 * previous mount was re-rendered under the new locale, held on screen for the
 * ~100ms floor of `waitForAnimations()` in the `completing` phase, and emitted
 * its own STORY_RENDERED and STORY_FINISHED before being torn down. Emitting
 * here aborts that render during `loading` instead, so a locale change
 * produces one render rather than two and nothing is painted from the mount
 * that is about to be discarded.
 *
 * The remount resets state inside the story's component tree and nothing else.
 * Whatever a story keeps outside it survives, as it survives any remount.
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
