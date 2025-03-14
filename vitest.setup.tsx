import "@/scripts/load-test-env";
import "@testing-library/jest-dom/vitest";
import "@/test/expect/react";
import "@/test/expect/zod";
import { cleanup } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { afterEach, vi } from "vitest";

// JSDOM does not provide this properly, and its existence (but not proper implementation) is necessary for testing Radix UI components
window.HTMLElement.prototype.scrollIntoView = vi.fn();
// Same as above, but for CodeMirror
window.Range.prototype.getClientRects = () => {
    return [] as unknown as DOMRectList;
};

// Globally mock Next.js's Image component, which does not work as-is in the test environment
vi.mock("next/image", () => {
    return {
        __esModule: true,
        default: ({ src, alt, ...rest }: { src: string | StaticImageData; alt: string }) => {
            // The no-img-element rule is disabled because this is a mock only for testing purposes, necessary because the real Image from next/image does not work in the test environment
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={typeof src === "string" ? src : src.src} alt={alt} {...rest} />;
        },
    };
});

afterEach(() => {
    vi.resetAllMocks();
    cleanup();
});
