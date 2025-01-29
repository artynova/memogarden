import { AutoSignout } from "@/app/signout/components/auto-signout";

/**
 * This is not a page to confirm signing out, it is a page that automatically triggers the server action for signing
 * out. This is necessary to accomplish signing out (properly, with token destruction) from server component code,
 * if the code detects an invalid session, by redirecting the user agent to this page.
 */
export default function Page() {
    return <AutoSignout />;
}
