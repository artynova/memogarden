import {
    REDIRECT_WITH_TOKEN_TO,
    REDIRECT_WITHOUT_TOKEN_TO,
    shouldAllowWithToken,
    shouldAllowWithoutToken,
} from "@/lib/routes";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

const { auth } = NextAuth({
    providers: [],
    callbacks: {
        session({ session, token }) {
            return { ...session, user: { ...session.user, id: token.id } }; // The ID is present on the JWT token, but it still needs to be forwarded to the session's user object with this code
        },
    },
}); // Lightweight instance, only used as a convenience wrapper for NextAuth API calls. Full instance cannot be used because some libraries used in the implementation are not available in the edge (middleware) runtime

/**
 * Catches most simple session errors and redirects away from routes that either strictly require a session or cannot
 * be visited by users with a session (an example of the latter is, for example, the sign-up route).
 *
 * @returns Next.js response.
 */
export default auth((req) => {
    const { nextUrl } = req;
    const hasToken = !!req.auth?.user?.id; // The existence of a valid user ID on the token proves that it was a valid token at some point, but it may have been invalidated since then, so this is not a full proof of authentication

    if (!hasToken && !shouldAllowWithoutToken(nextUrl))
        return NextResponse.redirect(new URL(REDIRECT_WITHOUT_TOKEN_TO, nextUrl));

    if (hasToken && !shouldAllowWithToken(nextUrl))
        return NextResponse.redirect(new URL(REDIRECT_WITH_TOKEN_TO, nextUrl));
});

/**
 * Middleware config that excludes API endpoints (which handle protection themselves) and static content (which is
 * public).
 */
export const config = {
    matcher: ["/((?!api|static|_next/static|_next/image|favicon.ico).*)"],
};
