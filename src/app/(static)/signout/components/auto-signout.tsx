"use client";

import { useEffect } from "react";
import { signout } from "@/server/actions/user/actions";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";

/**
 * Client component that automatically initiates the sign-out action.
 *
 * @returns The component.
 */
export function AutoSignout() {
    useEffect(() => {
        ignoreAsyncFnResult(signout)();
    }, []);
    return null;
}
