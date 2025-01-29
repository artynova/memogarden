import { getUserOrRedirectSC } from "@/lib/server-utils";
import { getAllAvatars, isCredentialsUser } from "@/server/data/services/user";
import { AccountPage } from "@/app/account/components/account-page";

export default async function Page() {
    const user = await getUserOrRedirectSC();
    const usesCredentials = await isCredentialsUser(user.id);
    const avatars = await getAllAvatars();
    return <AccountPage user={user} usesCredentials={usesCredentials} avatars={avatars} />;
}
