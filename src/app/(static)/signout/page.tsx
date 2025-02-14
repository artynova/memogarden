import { AutoSignout } from "@/app/(static)/signout/components/auto-signout";

/**
 * Page that automatically triggers the server action for signing out. This is necessary to accomplish signing out
 * (properly, with token destruction) from server component code if the code detects invalid session data.
 *
 * @returns The component.
 */
export default function Page() {
    return <AutoSignout />;
}
