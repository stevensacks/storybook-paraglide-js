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
 Guards the remount on locale change. The component counts clicks in state, so
 the assertion only holds on a fresh mount: switch the locale in the toolbar
 and, if the old mount survives the switch, this click lands on a counter that
 is already at 1 and the button reads 2.
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
