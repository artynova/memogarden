import { SignOutButton } from "@/components/page/main/template/sign-out-button";
import { signout } from "@/server/actions/user/actions";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/server/actions/user/actions");

const mockedSignout = vi.mocked(signout);

describe(SignOutButton, () => {
    describe("when clicked", () => {
        test("should call 'signout' server action", () => {
            render(<SignOutButton />);
            const button = screen.getByRole("button");
            fireEvent.click(button);

            expect(mockedSignout).toHaveBeenCalledOnce();
        });
    });
});
