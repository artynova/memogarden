"use client";

import { Button, ButtonProps } from "@/components/shadcn/button";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { signout } from "@/server/actions/user/actions";

/**
 * Dedicated sign out button that calls the corresponding server action. Necessary because the click handler
 * needs to be created within a client component. Since the click behavior of this button is predefined, it does not
 * accept the onClick prop.
 *
 * @param props Component properties.
 * @returns The component.
 */
export function SignOutButton(props: Omit<ButtonProps, "onClick">) {
    return <Button {...props} onClick={ignoreAsyncFnResult(signout)} />;
}
