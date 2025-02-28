"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { INVALID_TOKEN_FLAG, REDIRECT_WITHOUT_TOKEN_TO } from "@/lib/routes";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";

/**
 * Client component that checks search parameters for the invalid token flag that is used by the server to notify that
 * the user was redirected to the sign-in page because they have an invalidated JWT token (as opposed to not having one
 * at all), meaning that the token needs to be cleaned up. After the sign-out is complete, the component triggers a
 * redirect to the base sign-in route (without the flag).
 *
 * This component does not render anything.
 *
 * @returns The component.
 */
export function InvalidTokenHandler() {
    const params = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function handleInvalidToken() {
            await signOut({ redirect: false });
            router.replace(REDIRECT_WITHOUT_TOKEN_TO, { scroll: false }); // No need to scroll to the top since this redirect only removes the parameter that triggers this sign-out flow, and does not affect rendering
        }

        if (params.has(INVALID_TOKEN_FLAG)) ignoreAsyncFnResult(handleInvalidToken)();
    }, [params, router]);

    return null;
}
