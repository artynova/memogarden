"use client";

import { SelectAvatar, SelectUser } from "@/server/data/services/user";
import { ControlledSelectTimezone } from "@/app/(main)/account/components/controlled-select-timezone";
import { useState } from "react";
import { PageTemplate } from "@/components/ui/page/template/page-template";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/ui/modal/controlled-modal-collection";
import { ChangePasswordForm } from "@/app/(main)/account/components/change-password-form";
import { Button } from "@/components/ui/base/button";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";
import { signOutEverywhere, updateUser } from "@/server/actions/user";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { Clock, SquareAsterisk, TriangleAlert } from "lucide-react";
import { ControlledSelectAvatar } from "@/app/(main)/account/components/controlled-select-avatar";
import { useRouter } from "next/navigation";
import { ThemeDropdown } from "@/app/(main)/account/components/theme-dropdown";
import { Theme } from "@/lib/ui";

export interface AccountPageProps {
    user: SelectUser;
    usesCredentials: boolean;
    avatars: SelectAvatar[];
}

export function AccountPage({ user, usesCredentials, avatars }: AccountPageProps) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
    const router = useRouter();
    const inferredTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const modals: ModalData[] = usesCredentials
        ? [
              {
                  title: "Change password",
                  description: "Enter your current and new password.",
                  children: <ChangePasswordForm onCancel={() => setCurrentModalIndex(null)} />,
              },
          ]
        : [];

    async function onTimezoneChange(value: string) {
        await updateUser({ timezone: value, avatarId: user.avatarId, darkMode: user.darkMode });
        router.refresh();
    }

    async function onAvatarChange(value: number) {
        await updateUser({ timezone: user.timezone, avatarId: value, darkMode: user.darkMode });
        router.refresh();
    }

    async function onThemeChange(value: Theme) {
        await updateUser({
            timezone: user.timezone,
            avatarId: user.avatarId,
            darkMode: value === "dark" ? true : value === "light" ? false : null,
        });
        router.refresh();
    }

    return (
        <PageTemplate title={"Account"} user={user} footerActions={[]}>
            <ContentWrapper variant={"compact"}>
                <div className={"flex flex-col gap-6 md:flex-row"}>
                    <ControlledSelectTimezone
                        value={user.timezone}
                        onValueChange={ignoreAsyncFnResult(onTimezoneChange)}
                    />
                    <Button
                        onClick={ignoreAsyncFnResult(onTimezoneChange.bind(null, inferredTimezone))}
                        disabled={user.timezone === inferredTimezone}
                    >
                        <span>Decide for me</span>
                        <Clock />
                    </Button>
                    <ThemeDropdown onThemeChange={ignoreAsyncFnResult(onThemeChange)} />
                </div>
                <ControlledSelectAvatar
                    avatarIndex={user.avatarId}
                    onAvatarIndexChange={ignoreAsyncFnResult(onAvatarChange)}
                    avatars={avatars}
                />
                <div className={"flex flex-col items-center justify-center gap-6 md:flex-row"}>
                    {usesCredentials && (
                        <Button
                            className={"w-full md:w-1/2"}
                            onClick={() => setCurrentModalIndex(0)}
                        >
                            <span>Change password</span>
                            <SquareAsterisk />
                        </Button>
                    )}

                    <Button
                        className={"w-full md:w-1/2"}
                        variant={"destructive"}
                        onClick={ignoreAsyncFnResult(signOutEverywhere)}
                    >
                        <span>Sign out everywhere</span>
                        <TriangleAlert />
                    </Button>
                </div>
            </ContentWrapper>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
