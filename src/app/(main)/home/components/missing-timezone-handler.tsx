"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { SelectUser } from "@/server/data/services/user";
import { updateUser } from "@/server/actions/user/actions";

/**
 * Client component that checks whether a user's timezone setting is missing and, if yes, infers it based on browser settings
 * and sends the inferred value to the backend. This is used to work around the issue that the client browser timezone cannot be delivered directly
 * to the user-inserting part of the first OAuth authentication flow (the flow's code gets triggered in response to a ping from the OAuth provider
 * once the authentication process is completed on their end).
 *
 * This component does not render anything.
 *
 * @param props Component properties.
 * @param props.user User data for for performing the timezone check.
 * @returns The component.
 */
export function MissingTimezoneHandler({ user }: { user: SelectUser }) {
    const router = useRouter();
    useEffect(() => {
        async function handleMissingTimezone() {
            await updateUser({
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                avatarId: user.avatarId,
                darkMode: user.darkMode,
            });
            router.refresh();
        }

        if (user.timezone === null) ignoreAsyncFnResult(handleMissingTimezone)();
    }, [user.timezone, user.avatarId, user.darkMode, router]);

    return null;
}
