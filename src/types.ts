/**
 * The shape of the runtime Paraglide JS generates into your project's `outdir`
 * (e.g. `./src/paraglide/runtime.js`).
 *
 * This is declared structurally rather than imported, because the runtime is
 * compiler output that lives in your project, not an export of
 * `@inlang/paraglide-js`.
 *
 * The members are written as methods rather than function-typed properties on
 * purpose. A generated runtime types its locale as a narrow union of the
 * locales you compiled ("en" | "fr" | ...), which would not be assignable to a
 * `string` under strictFunctionTypes. Method syntax is checked bivariantly, so
 * any generated runtime satisfies this regardless of its locale union.
 */
export type ParaglideRuntime = {
    baseLocale: string;
    locales: readonly string[];
    getLocale(): string;
    overwriteGetLocale(fn: () => string): void;
    isLocale?(value: unknown): boolean;
    getTextDirection?(locale?: string): 'ltr' | 'rtl';
};

export type ParaglideParameters = {
    /** The module namespace object of your generated `paraglide/runtime`. */
    runtime: ParaglideRuntime;
    /**
     * Sync `lang` and `dir` onto the preview document's `<html>` element
     * whenever the locale changes.
     *
     * @default true
     */
    setDocumentAttributes?: boolean;
};
