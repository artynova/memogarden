import { signout } from "@/server/actions/user/actions";
import { auth } from "@/server/auth";
import { getUser, maybeSyncUserHealth } from "@/server/data/services/user";
import { redirect } from "next/navigation";

/**
 * Search parameter as provided to page components by Next.js.
 */
export type SearchParam = string | string[] | undefined;

/**
 * Properties of a page that accepts search parameters.
 */
export interface PageWithSearchParamsProps {
    /**
     * Parameters parsed by Next.js.
     */
    searchParams: Promise<{ [key: string]: SearchParam }>;
}

/**
 * Properties of a page that accepts a path parameter named "id" and shows data associated with a singular resource
 * corresponding to that id.
 */
export interface ResourceSpecificPageProps {
    /**
     * Path parameters.
     */
    params: Promise<{ id: string }>;
}

/**
 * Parses a single string value for a search parameter expected to have such a value.
 *
 * @param param Next.js parameter.
 * @returns Parsed value (first if there were several values provided), or `null` if the parameter's value was missing.
 */
export function parseStringParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    return Array.isArray(param) ? param[0] : param;
}

/**
 * Parses a single integer value for a search parameter expected to have such a value.
 *
 * @param param Next.js parameter.
 * @returns Parsed value (first if there were several values provided), or `null` if the parameter's value was missing
 * or not a number.
 */
export function parseIntParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    const parsed = parseInt(Array.isArray(param) ? param[0] : param);
    return isNaN(parsed) ? null : parsed;
}
/**
 * If the current session is valid, synchronizes the health of the associated user and returns the updated user data.
 * Otherwise, redirects to the sign-in page with the invalid token flag in search parameters (which is done by throwing
 * an exception and interrupting the flow).
 *
 * This version of the method is meant for Server Components, which cannot modify cookies and need
 * to rely on the intermediate sign-out page to destroy any invalid cookies.
 *
 * @returns User data after synchronization.
 */
export async function getUserOrRedirectSC() {
    const { id, tokenIat } = (await auth())?.user ?? {};
    if (!id) signoutSC(); // This triggers a redirect, which works by throwing an exception, so in subsequent code the id can be safely assumed to be truthy
    const user = await getUser(id!);
    if (!user) signoutSC(); // Again, this branch triggers an exception if the user object is falsy, so in subsequent code it can be assumed to be truthy
    if (user!.acceptTokensAfter > new Date((tokenIat ?? 0) * 1000)) signoutSC();
    const syncHappened = await maybeSyncUserHealth(id!);
    return syncHappened ? (await getUser(id!))! : user!; // Re-fetch the user only if the sync did occur
}

/**
 * Redirects to the sign-in route with the search parameters flag to trigger token destruction, allowing to trigger a
 * seamless sign-out from Server Components.
 *
 * @returns Never (throws an exception).
 */
function signoutSC() {
    return redirect("/signin?invalidToken");
}

/**
 * If the current session is valid, synchronizes the health of the associated user and returns the
 * updated user data. Otherwise, destroys any session cookies and redirects to the sign-in page
 * (which is done by throwing an exception and interrupting the flow).
 *
 * This works in any server context where cookies can be modified, but does not work in
 * Server Components.
 *
 * @returns User data after synchronization.
 * @see getUserOrRedirectSC
 */
export async function getUserOrRedirect() {
    const { id, tokenIat } = (await auth())?.user ?? {};
    if (!id) await signout(); // This triggers a redirect, which works by throwing an exception, so in subsequent code the id can be safely assumed to be truthy
    const user = await getUser(id!);
    if (!user) await signout(); // Again, this branch triggers an exception if the user object is falsy, so in subsequent code it can be assumed to be truthy
    if (user!.acceptTokensAfter > new Date((tokenIat ?? 0) * 1000)) await signout();
    const syncHappened = await maybeSyncUserHealth(id!);
    return syncHappened ? (await getUser(id!))! : user!; // Re-fetch the user only if the sync did occur
}

/**
 * If the current session is valid, synchronizes the health of the associated user and returns just
 * the user's ID. Otherwise, destroys any session cookies and redirects to the sign-in page (which
 * is done by throwing an exception and interrupting the flow).
 *
 * This is a convenience wrapper for {@link getUserOrRedirect} that is for cases when only the ID
 * is needed.
 *
 * @returns User's ID.
 */
export async function getUserIdOrRedirect() {
    return (await getUserOrRedirect()).id;
}
