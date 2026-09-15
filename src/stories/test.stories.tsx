import React from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {m} from '../paraglide/messages';
import Test from './Test';

const meta: Meta = {
    title: 'Test',
    component: Test,
};

export default meta;

export const Default: StoryObj = {
    render: () => <Test />,
};

/*
 A stateful fixture for checking locale switches by hand: click the button,
 change the locale in the toolbar, and the story remounts, so the counter
 starts over and this assertion holds again in the new language.

 It is a smoke test that a play function runs under the decorator and the
 loader. It does not guard when the remount happens, which is only observable
 against Storybook's render loop, not from inside a story.
*/
export const Counter: StoryObj = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');

        await userEvent.click(button);

        await expect(button).toHaveTextContent(m.click({count: 1}));
    },
    render: () => <Test />,
};

export const English: StoryObj = {
    parameters: {
        locale: 'en',
    },
    render: () => <Test />,
};

export const French: StoryObj = {
    parameters: {
        locale: 'fr',
    },
    render: () => <Test />,
};

export const Japanese: StoryObj = {
    parameters: {
        locale: 'ja',
    },
    render: () => <Test />,
};

export const Arabic: StoryObj = {
    parameters: {
        locale: 'ar',
    },
    render: () => <Test />,
};
