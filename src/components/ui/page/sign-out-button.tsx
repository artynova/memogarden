"use client";

import { Button, ButtonProps } from "@/components/ui/base/button";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { signout } from "@/server/actions/auth";

export type SignOutButtonProps = Omit<ButtonProps, "onClick">;

/**
 * Simple dedicated sign out button that calls the corresponding server action.
 * Necessary because the on click handler needs to be created within a client component.
 * Since the on click behavior of this button is predefined, it does not accept the onClick prop.
 */
export function SignOutButton(props: SignOutButtonProps) {
    return <Button {...props} onClick={ignoreAsyncFnResult(signout)} />;
}
