#!/usr/bin/env node

/*
 Verifies that every file package.json's `exports` map points at is actually on
 disk. v10.0.1 shipped without its declarations because the tarball was packed
 while tsup was still writing them, and nothing noticed: `exports` kept pointing
 `types` at dist/index.d.ts and dist/preview.d.ts, which were not in the
 tarball, so the package resolved with no types at all.

 Deliberately plain Node with no imports beyond node: builtins. This runs from
 `prepack`, which also runs for anyone installing the package straight from git,
 where devDependencies are not available.
*/

import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);

const packageJson = JSON.parse(
    await readFile(new URL('package.json', root), 'utf8'),
);

const targets = new Set();

const collect = (value) => {
    if (typeof value === 'string') {
        if (value.startsWith('./')) targets.add(value);

        return;
    }

    if (value && typeof value === 'object')
        Object.values(value).forEach(collect);
};

collect(packageJson.exports);

const missing = [...targets].filter(
    (target) => !existsSync(new URL(target, root)),
);

if (missing.length > 0) {
    console.error(
        `\nMissing build output. package.json "exports" points at ${missing.length} file(s) that are not on disk:\n`,
    );

    missing.forEach((target) => console.error(`  ${target}`));

    console.error(
        "\nRun 'npm run build' and check that tsup emitted its .d.ts files. Publishing now would ship a package that resolves to nothing, or to no types.\n",
    );

    process.exit(1);
}
