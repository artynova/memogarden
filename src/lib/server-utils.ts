import { getUser, maybeSyncUserHealth, SelectUser } from "@/server/data/services/user";
import { DateTime } from "luxon";
import { AUTO_SIGNOUT } from "@/lib/routes";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { signout } from "@/server/actions/user";

/**
 * If the current session is valid, synchronizes the health of the associated user and returns the updated user data.
 * Otherwise, redirects to the sign-in page (which is done by throwing an exception and interrupting the flow).
 *
 * This version of the method is meant for Server Components, which cannot modify cookies and need to rely on an
 * intermediate page.
 *
 * @return User data after synchronization.
 */
export async function getUserOrRedirectSC() {
    const id = (await auth())?.user?.id;
    if (!id) signoutSC(); // This triggers a redirect, which works by throwing an exception, so in subsequent code the id can be safely assumed to be truthy
    const user = await getUser(id!);
    if (!user) signoutSC(); // Again, this branch triggers an exception if the user object is falsy, so in subsequent code it can be assumed to be truthy
    const syncHappened = await maybeSyncUserHealth(id!);
    return syncHappened ? (await getUser(id!))! : user!; // Re-fetch the user only if the sync did occur
}

function signoutSC() {
    redirect(AUTO_SIGNOUT);
}

/**
 * If the current session is valid, synchronizes the health of the associated user and returns the updated user data.
 * Otherwise, redirects to the sign-in page (which is done by throwing an exception and interrupting the flow).
 *
 * This works in any server context where cookies can be modified, but does not work in Server Components.
 *
 * @return User data after synchronization.
 * @see getUserOrRedirectSC
 */
export async function getUserOrRedirect() {
    const id = (await auth())?.user?.id;
    if (!id) await signout(); // This triggers a redirect, which works by throwing an exception, so in subsequent code the id can be safely assumed to be truthy
    const user = await getUser(id!);
    if (!user) await signout(); // Again, this branch triggers an exception if the user object is falsy, so in subsequent code it can be assumed to be truthy
    const syncHappened = await maybeSyncUserHealth(id!);
    return syncHappened ? (await getUser(id!))! : user!; // Re-fetch the user only if the sync did occur
}

/**
 * If the current session is valid, synchronizes the health of the associated user and returns just the ID of the user.
 * Otherwise, redirects to the sign-in page (which is done by throwing an exception and interrupting the flow).
 *
 * This is a convenience wrapper for {@link getUserOrRedirectSC} that is for cases when only an ID is needed.
 *
 * @return User's ID.
 */
export async function getUserIdOrRedirect() {
    return (await getUserOrRedirect()).id;
}

export type SearchParam = string | string[] | undefined;

export function parseStringParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    return Array.isArray(param) ? param[0] : param;
}

export function parseIntParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    const parsed = parseInt(Array.isArray(param) ? param[0] : param);
    return isNaN(parsed) ? null : parsed;
}

export function getUserDayEnd(user: SelectUser, date: Date) {
    return DateTime.fromJSDate(date).setZone(user.timezone).endOf("day").toJSDate();
}
