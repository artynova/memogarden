// Strictly client component

import { memoGarden } from "@/components/markdown/codemirror-theme";
import { cn } from "@/lib/ui/generic";
import { markdown } from "@codemirror/lang-markdown";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
    ComponentProps,
    FocusEvent,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { ControllerRenderProps } from "react-hook-form";

/**
 * Wrapper around the {@link CodeMirror} component that aligns it with the interface expected by react-hook-form.
 *
 * @param props Component properties.
 * @param props.onChange Value change callback.
 * @param props.onBlur Blur callback.
 * @param props.value Current value.
 * @param props.disabled Whether the input is disabled.
 * @param props.ref Reference.
 * @returns The component.
 */
const ControlledMarkdownInput = forwardRef<
    HTMLDivElement | undefined,
    Partial<ControllerRenderProps> & ComponentProps<"div">
>(({ onChange, onFocus, onBlur, value, disabled, ...rest }, ref) => {
    const [editorFocused, setEditorFocused] = useState(false);
    const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(ref, () => codeMirrorRef.current?.editor ?? undefined, [codeMirrorRef]);

    // We are only interested in the value from the change, not in any other data provided to the change callback by CodeMirror
    function onChangeInternal(value: string) {
        if (onChange) onChange(value);
    }

    function onFocusInternal(event: FocusEvent<HTMLDivElement, Element>) {
        setEditorFocused(true);
        if (onFocus) onFocus(event);
    }

    function onBlurInternal() {
        setEditorFocused(false);
        if (onBlur) onBlur();
    }

    return (
        <CodeMirror
            className={cn(
                "min-h-9 w-full overflow-hidden rounded-md border bg-transparent px-3 py-1 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                editorFocused ? "outline-none ring-1 ring-ring" : "", // CodeMirror does not support standard HTML focusing
            )}
            onChange={onChangeInternal}
            onFocus={onFocusInternal}
            onBlur={onBlurInternal}
            value={value as string | undefined}
            editable={!disabled}
            extensions={[markdown(), memoGarden]}
            ref={codeMirrorRef}
            onCreateEditor={(view) => {
                // Assign other attributes to the editor DOM element
                Object.entries(rest).forEach(([key, value]) => {
                    if (typeof value === "string") {
                        view.dom.setAttribute(key, value);
                    }
                });
            }}
        />
    );
});
ControlledMarkdownInput.displayName = "ControlledMarkdownInput";

export { ControlledMarkdownInput };
