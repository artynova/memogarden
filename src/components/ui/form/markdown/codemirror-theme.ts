import { tags } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting, TagStyle } from "@codemirror/language";

const config = {
    background: "transparent",
    foreground: "hsl(var(--foreground))",
    selection: "hsla(var(--chart-3) / 0.5)",
    selectionMatch: "hsl(var(--secondary))",
    gutterElementForeground: "hsl(var(--muted-foreground))",
    foldPlaceholderBackground: "hsl(var(--muted))",
    foldPlaceholderForeground: "hsl(var(--muted-foreground))",
    foldPlaceholderBorder: "hsl(var(--input))",
    activeLine: "hsla(var(--secondary) / 0.25)",
    keyword: "hsl(var(--primary))",
    variable: "hsl(var(--chart-2))",
    function: "hsl(var(--chart-3))",
    string: "hsl(var(--chart-4))",
    constant: "hsl(var(--chart-5))",
    type: "hsl(var(--chart-1))",
    class: "hsl(var(--chart-3))",
    number: "hsl(var(--chart-5))",
    comment: "hsl(var(--muted-foreground))",
    heading: "hsl(var(--primary))",
    invalid: "hsl(var(--destructive))",
    regexp: "hsl(var(--destructive-foreground))",
    tag: "hsl(var(--chart-2))",
    font: "var(--font-display)",
} as const;

const memoGardenBaseStyles = {
    "&": { color: config.foreground },
    "&.cm-editor, .cm-gutters": { backgroundColor: config.background },
    "& .cm-gutters": { borderRight: "0px" },
    "& .cm-activeLineGutter, .cm-activeLine": { backgroundColor: config.activeLine },
    "& .cm-selectionMatch": { backgroundColor: config.selectionMatch },
    "&.cm-focused .cm-selectionBackground, & .cm-line::selection, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: `${config.selection} !important` },
    "&.cm-focused": { outline: "0px" },
    "&.cm-editor .cm-scroller": { fontFamily: config.font },
    "& .cm-gutterElement": { color: config.gutterElementForeground },
    "& .cm-foldPlaceholder": {
        backgroundColor: config.foldPlaceholderBackground,
        border: `1px solid ${config.foldPlaceholderBorder}`,
        color: config.foldPlaceholderForeground,
        margin: "0 3px",
    },
} as const;

const memoGardenHighlightStyles: TagStyle[] = [
    { tag: tags.keyword, color: config.keyword },
    { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: config.variable },
    { tag: [tags.propertyName], color: config.function },
    {
        tag: [tags.processingInstruction, tags.string, tags.inserted, tags.special(tags.string)],
        color: config.string,
    },
    { tag: [tags.function(tags.variableName), tags.labelName], color: config.function },
    {
        tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
        color: config.constant,
    },
    { tag: [tags.definition(tags.name), tags.separator], color: config.variable },
    { tag: [tags.className], color: config.class },
    {
        tag: [tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
        color: config.number,
    },
    { tag: [tags.typeName], color: config.type, fontStyle: config.type },
    { tag: [tags.operator, tags.operatorKeyword], color: config.keyword },
    { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: config.regexp },
    { tag: [tags.meta, tags.comment], color: config.comment },
    { tag: tags.tagName, color: config.tag },
    { tag: tags.strong, fontWeight: "bold" },
    { tag: tags.emphasis, fontStyle: "italic" },
    { tag: tags.link, textDecoration: "underline" },
    { tag: tags.heading, fontWeight: "bold", color: config.heading },
    { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: config.variable },
    { tag: tags.invalid, color: config.invalid },
    { tag: tags.strikethrough, textDecoration: "line-through" },
] as const;

function initTheme() {
    const themeExtension = EditorView.theme(memoGardenBaseStyles);
    const highlightStyle = HighlightStyle.define(memoGardenHighlightStyles);
    return [themeExtension, syntaxHighlighting(highlightStyle)];
}

/**
 * CodeMirror theme that aligns the editor styles more closely with MemoGarden's overall style.
 */
export const memoGarden = initTheme();
