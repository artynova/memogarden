import { SignOutButton } from "@/components/page/main/template/sign-out-button";
import { signout } from "@/server/actions/user/actions";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/server/actions/user/actions");

const mockedSignout = vi.mocked(signout);

describe(SignOutButton, () => {
    test("should call the 'signout' server action on click", () => {
        render(<SignOutButton />);
        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(mockedSignout).toHaveBeenCalledOnce();
    });
});
