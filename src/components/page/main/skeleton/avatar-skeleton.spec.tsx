import { AvatarSkeleton } from "@/components/page/main/skeleton/avatar-skeleton";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(AvatarSkeleton, () => {
    test("should be round", () => {
        const { container } = render(<AvatarSkeleton />);
        const elements = container.getElementsByTagName("div");

        expect(elements.length).toEqual(1);
        expect(elements[0]).toHaveClass("rounded-full");
    });
});
