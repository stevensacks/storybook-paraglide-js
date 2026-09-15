import type {Renderer, ProjectAnnotations} from 'storybook/internal/types';
import i18n from 'storybook-i18n/preview';
import {withParaglide} from './withParaglide';

const i18nDecorators = i18n.decorators || [];

const preview: ProjectAnnotations<Renderer> = {
    ...i18n,
    // @ts-ignore
    decorators: [...i18nDecorators, withParaglide],
};

export default preview;
