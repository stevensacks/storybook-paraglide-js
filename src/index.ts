export type {ParaglideParameters, ParaglideRuntime} from './types';

import {definePreviewAddon} from 'storybook/internal/csf';
import addonAnnotations from './preview';

export default () => definePreviewAddon(addonAnnotations);
