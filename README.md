# Storybook Paraglide JS addon

Easy [Paraglide JS](https://paraglidejs.com) Storybook integration.

Required Peer Dependencies:

- Version 10.x - storybook - `^9.0.0 || ^10.0.0`
- @inlang/paraglide-js - `^2.0.0`

This Storybook addon assumes your project is already set up with [Paraglide JS](https://paraglidejs.com/getting-started),
with a compiled `paraglide` output directory, and that it is properly configured and working.

This addon is **framework agnostic**. Paraglide compiles your messages into plain functions, so there is no
provider to wrap your stories in. It works with React, Svelte, Vue, Solid, Angular and web components alike.

## Installation

Install this addon as a devDependency.

```bash
npm i -D storybook-paraglide-js
```

## Usage

After installing, follow these 3 steps to enable this addon in Storybook.

### main.ts

Insert this addon into your addons array:

```typescript
{
    addons: [
        // other addons...
        'storybook-paraglide-js',
    ];
}
```

---

### Compile your messages

Storybook needs the generated Paraglide runtime to exist before it starts, so compile it in a pre-step:

```json
{
    "scripts": {
        "paraglide": "paraglide-js compile --project ./project.inlang --outdir ./src/paraglide",
        "paraglide:watch": "npm run paraglide -- --watch",
        "prestorybook": "npm run paraglide",
        "prebuild-storybook": "npm run paraglide",
        "storybook": "storybook dev -p 6006"
    }
}
```

To pick up message edits without restarting, run the compiler's watch mode alongside Storybook:

```bash
npm-run-all --parallel paraglide:watch storybook
```

> [!IMPORTANT]
> Do **not** add `paraglideVitePlugin` to Storybook's `viteFinal`. The plugin recompiles at `buildStart`,
> rewriting files underneath Vite while it is still optimizing dependencies. Vite then produces a second
> dependency cache, the preview ends up with two copies of React, and every story fails with
> `Invalid hook call. Hooks can only be called inside of the body of a function component.`
>
> Compile with the CLI instead, as shown above. Your application build can keep using the Vite plugin
> normally - this only applies to Storybook.

---

### preview.ts

Import your generated runtime and pass it to the `paraglide` parameter, then declare which locales the
toolbar should offer:

```typescript
import type {Preview} from '@storybook/react-vite';
import * as runtime from '../src/paraglide/runtime';

const preview: Preview = {
    initialGlobals: {
        locale: 'en',
        locales: {
            en: 'English',
            fr: 'Français',
            ja: '日本語',
        },
    },
    parameters: {
        paraglide: {runtime},
    },
};

export default preview;
```

The `locales` values can take several shapes. Plain strings:

```typescript
locales: {
    en: 'English',
    fr: 'Français',
    ja: '日本語',
},
```

Full locale codes:

```typescript
locales: {
    'en-US': 'English (US)',
    'fr-FR': 'Français',
    'ja-JP': '日本語',
},
```

An object with an icon, a title and a right-aligned label:

```typescript
locales: {
    en: {icon: '🇺🇸', title: 'English', right: 'EN'},
    fr: {icon: '🇫🇷', title: 'Français', right: 'FR'},
    ja: {icon: '🇯🇵', title: '日本語', right: 'JP'},
},
```

Or just a title and a right-aligned label:

```typescript
locales: {
    en: {title: 'English', right: 'EN'},
    fr: {title: 'Français', right: 'FR'},
    ja: {title: '日本語', right: 'JP'},
},
```

## Options

The `paraglide` parameter accepts:

| Option                  | Type    | Default  | Description                                                                                          |
| ----------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `runtime`               | module  | required | The module namespace object of your generated `paraglide/runtime`.                                   |
| `setDocumentAttributes` | boolean | `true`   | Sync `lang` and `dir` onto the preview document's `<html>` element, so RTL locales render correctly. |

```typescript
parameters: {
    paraglide: {
        runtime,
        setDocumentAttributes: false,
    },
},
```

## Story Parameters Locale

You can set the locale for an individual story with the `locale` parameter.

```typescript
export const French: StoryObj = {
    parameters: {
        locale: 'fr',
    },
};
```

Be aware that this sets the locale globally when the story loads, so it stays selected when you navigate to
another story that does not specify its own `locale` parameter.

## Why this addon doesn't call setLocale()

Paraglide's `setLocale()` treats a locale change as a full document navigation: it reloads the page or
navigates to the localized URL. That is the right behaviour in an app, and the wrong behaviour inside
Storybook's preview iframe.

Instead, this addon calls `overwriteGetLocale()` with the locale selected in the toolbar, which is the
mechanism Paraglide documents for externally controlled locale resolution. Whatever `strategy` your project
configures (`url`, `cookie`, `localStorage`) is bypassed inside Storybook, so your stories are driven purely
by the toolbar and by story `locale` parameters.

After the locale changes, the addon remounts the story so cached strings are discarded. The remount is
requested before the story renders, so the previous mount is never painted under the new locale.

The remount resets state held in the story's component tree. State that lives outside it, in a module-level
store, a singleton, or anything else that survives unmounting, is not reset, so a play function that depends
on such state has to reset it itself. For the remount to do its job, call your messages during render:

```tsx
// Good - re-evaluated on every render
const Greeting = () => <h1>{m.hello()}</h1>;

// Bad - evaluated once, at module load, and never updated
const greeting = m.hello();
const Greeting = () => <h1>{greeting}</h1>;
```

## Troubleshooting

### `Module not found: Can't resolve '$paraglide/runtime.js'`

This is the most common Paraglide + Storybook failure
([opral/paraglide-js#266](https://github.com/opral/paraglide-js/issues/266)). It has two separate causes and
you may hit both.

**1. The messages were never compiled.** The `paraglide` output directory is generated, not committed, so on
a clean checkout it does not exist when Storybook boots. Compile before Storybook starts:

```json
{
    "scripts": {
        "paraglide": "paraglide-js compile --project ./project.inlang --outdir ./src/paraglide",
        "prestorybook": "npm run paraglide",
        "prebuild-storybook": "npm run paraglide"
    }
}
```

**2. The `$paraglide` alias is not resolvable by Storybook's builder.** If you import the runtime as
`$paraglide/runtime.js` rather than by relative path, that alias is set up by your framework integration
(`paraglide-next`'s `next.config.mjs` plugin, SvelteKit's `$lib`, and so on). Storybook uses its own builder
config and does not inherit it.

Add the path to `tsconfig.json` so TypeScript resolves it:

```json
{
    "compilerOptions": {
        "paths": {
            "$paraglide/*": ["./src/paraglide/*"]
        }
    }
}
```

and add the matching alias to Storybook's builder. For Vite based frameworks:

```typescript
viteFinal: (config) =>
    mergeConfig(config, {
        resolve: {
            alias: {
                $paraglide: fileURLToPath(
                    new URL('../src/paraglide', import.meta.url),
                ),
            },
        },
    }),
```

For `@storybook/nextjs`, do the same in `webpackFinal` via `config.resolve.alias`.

The simplest way to avoid this entirely is to import the runtime by relative path in
`.storybook/preview.ts`, as shown above - the alias then never enters the picture.

### `Invalid hook call` / every story fails to render

If you added `paraglideVitePlugin` to Storybook's `viteFinal`, remove it. The plugin rewrites the generated
output while Vite is still optimizing dependencies, which leaves the preview with two copies of React. See
the note under [Compile your messages](#compile-your-messages).

---

Once set up, you should see a globe icon in the Storybook toolbar to select your locale.
