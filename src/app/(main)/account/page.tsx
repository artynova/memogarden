import { getAllAvatars, isCredentialsUser } from "@/server/data/services/user";
import { AccountPage } from "@/app/(main)/account/components/account-page";

import { getUserOrRedirectSC } from "@/lib/utils/server";

/**
 * Account settings page.
 *
 * @returns The component.
 */
export default async function Page() {
    const user = await getUserOrRedirectSC();
    const usesCredentials = await isCredentialsUser(user.id);
    const avatars = await getAllAvatars();
    return <AccountPage user={user} usesCredentials={usesCredentials} avatars={avatars} />;
}
