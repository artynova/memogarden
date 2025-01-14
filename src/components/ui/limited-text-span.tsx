import { getTrimmedText } from "@/lib/utils";

export interface LimitedTextSpanProps {
    text: string;
    maxLength: number;
    // Assumed to be the same as the general max length unless specified explicitly
    maxLengthMobile?: number;
}

export function LimitedTextSpan({ text, maxLength, maxLengthMobile }: LimitedTextSpanProps) {
    return (
        <>
            <span className={"hidden sm:inline"}>{getTrimmedText(text, maxLength)}</span>
            <span className={"sm:hidden"}>
                {getTrimmedText(text, maxLengthMobile ?? maxLength)}
            </span>
        </>
    );
}
