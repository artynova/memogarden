function getTrimmed(text: string, maxLength: number) {
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

export interface LimitedTextSpanProps {
    text: string;
    maxLength: number;
    // Assumed to be the same as the general max length unless specified explicitly
    maxLengthMobile?: number;
}

export function LimitedTextSpan({ text, maxLength, maxLengthMobile }: LimitedTextSpanProps) {
    return (
        <>
            <span className={"hidden md:inline"}>{getTrimmed(text, maxLength)}</span>
            <span className={"md:hidden"}>{getTrimmed(text, maxLengthMobile ?? maxLength)}</span>
        </>
    );
}
