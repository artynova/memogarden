"use client";

import { useEffect } from "react";
import { signout } from "@/server/actions/user";
import { ignoreAsyncFnResult } from "@/lib/utils";

export function AutoSignout() {
    useEffect(() => {
        ignoreAsyncFnResult(signout)();
    }, []);
    return null;
}
