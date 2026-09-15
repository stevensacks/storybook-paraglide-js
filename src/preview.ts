import type {Renderer, ProjectAnnotations} from 'storybook/internal/types';
import i18n from 'storybook-i18n/preview';
import {remountOnLocaleChange} from './remountOnLocaleChange';
import {withParaglide} from './withParaglide';

const toArray = <T>(value: T | readonly T[] | undefined): readonly T[] =>
    value === undefined ? [] : Array.isArray(value) ? value : [value as T];

const preview: ProjectAnnotations<Renderer> = {
    ...i18n,
    // @ts-ignore
    decorators: [...toArray(i18n.decorators), withParaglide],
    // The loader has to run before the story renders - see its own comment.
    // @ts-ignore
    loaders: [...toArray(i18n.loaders), remountOnLocaleChange],
};

export default preview;
