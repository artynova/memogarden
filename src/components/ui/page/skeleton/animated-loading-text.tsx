/**
 * Animated loading text that renders the word "Loading" with an animated ellipsis (cycling between one, two, and three
 * dots).
 */
export default function AnimatedLoadingText() {
    return (
        <span className={"inline-flex items-center"}>
            <span>Loading</span>
            <span className={"inline-block w-[3ch] text-left after:animate-ellipsis"} />
        </span>
    );
}
