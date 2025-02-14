import { getTrimmedText } from "@/lib/utils/generic";

/**
 * Span of text that gets trimmed with ellipses if it has too many characters.
 *
 * @param props Component properties.
 * @param props.text Text.
 * @param props.maxLength Maximum allowed length before text starts being trimmed.
 * @param props.maxLengthMobile Maximum allowed length on mobile devices. If not specified, the general maximum length
 * is used instead.
 * @returns The component.
 */
export function LimitedTextSpan({
    text,
    maxLength,
    maxLengthMobile,
}: {
    text: string;
    maxLength: number;
    maxLengthMobile?: number;
}) {
    return (
        <>
            <span className={"hidden sm:inline"}>{getTrimmedText(text, maxLength)}</span>
            <span className={"sm:hidden"}>
                {getTrimmedText(text, maxLengthMobile ?? maxLength)}
            </span>
        </>
    );
}
