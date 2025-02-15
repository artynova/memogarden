"use client";

import { SelectAvatar, SelectUser } from "@/server/data/services/user";
import { ControlledSelectTimezone } from "@/app/(main)/account/components/controlled-select-timezone";
import { useState } from "react";
import { PageTemplate } from "@/components/page/template/page-template";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/modal/controlled-modal-collection";
import { ChangePasswordForm } from "@/app/(main)/account/components/change-password-form";
import { Button } from "@/components/shadcn/button";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { signOutEverywhere, updateUser } from "@/server/actions/user/actions";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { Clock, SquareAsterisk, TriangleAlert } from "lucide-react";
import { ControlledSelectAvatar } from "@/app/(main)/account/components/controlled-select-avatar";
import { useRouter } from "next/navigation";
import { ThemeDropdown } from "@/app/(main)/account/components/theme-dropdown";
import { ConfirmationPrompt } from "@/components/confirmation-prompt";
import { TitledCard } from "@/components/titled-card";
import { Label } from "@/components/shadcn/label";
import { darkModeToTheme, Theme } from "@/lib/ui/theme";

/**
 * Client part of the account page.
 *
 * @param props Component properties.
 * @param props.user General user data.
 * @param props.usesCredentials Whether the user is credentials-authenticated and, as such, whether their account has
 * an associated password that may be changed from this page.
 * @param props.avatars Possible avatar selection options.
 * @returns The component.
 */
export function AccountPage({
    user,
    usesCredentials,
    avatars,
}: {
    user: SelectUser;
    usesCredentials: boolean;
    avatars: SelectAvatar[];
}) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
    const router = useRouter();
    const inferredTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const modals: ModalData[] = [
        {
            title: "Sign out everywhere?",
            description: "This will sign you out on all devices.",
            children: (
                <ConfirmationPrompt
                    onConfirm={ignoreAsyncFnResult(signOutEverywhere)}
                    onCancel={() => setCurrentModalIndex(null)}
                />
            ),
        },
    ];
    if (usesCredentials) {
        modals.push({
            title: "Change password",
            description:
                "Enter your current and new password. Changing your password will also sign you out on all devices.",
            children: <ChangePasswordForm onCancel={() => setCurrentModalIndex(null)} />,
        });
    }

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
        <PageTemplate title={"Account"} user={user}>
            <ContentWrapper variant={"compact"}>
                <TitledCard title={"Cosmetic"}>
                    <div className={"space-y-3"}>
                        <div className={"space-y-3"}>
                            <Label htmlFor={"theme-dropdown"}>Theme:</Label>
                            <ThemeDropdown
                                theme={darkModeToTheme(user.darkMode)}
                                onThemeChange={ignoreAsyncFnResult(onThemeChange)}
                                id={"theme-dropdown"}
                            />
                        </div>
                        <div className={"space-y-3"}>
                            <Label htmlFor={"select-avatar"}>Avatar:</Label>
                            <ControlledSelectAvatar
                                avatars={avatars}
                                avatarIndex={user.avatarId}
                                onAvatarChange={ignoreAsyncFnResult(onAvatarChange)}
                                id={"select-avatar"}
                            />
                        </div>
                    </div>
                </TitledCard>
                <TitledCard title={"Danger zone"}>
                    <div className={"space-y-3"}>
                        <Label htmlFor={"select-timezone"}>Your time zone:</Label>
                        <div className={"flex flex-col gap-3 sm:flex-row"}>
                            <ControlledSelectTimezone
                                value={user.timezone}
                                onValueChange={ignoreAsyncFnResult(onTimezoneChange)}
                                id={"select-timezone"}
                            />
                            <Button
                                onClick={ignoreAsyncFnResult(
                                    onTimezoneChange.bind(null, inferredTimezone),
                                )}
                                disabled={user.timezone === inferredTimezone}
                            >
                                <span>Infer time zone</span>
                                <Clock aria-label={"Infer time zone icon"} />
                            </Button>
                        </div>
                        <div
                            className={
                                "flex flex-col items-center justify-center gap-3 sm:flex-row"
                            }
                        >
                            {usesCredentials && (
                                <Button
                                    className={"w-full sm:w-1/2"}
                                    onClick={() => setCurrentModalIndex(1)}
                                >
                                    <span>Change password</span>
                                    <SquareAsterisk aria-label={"Change password icon"} />
                                </Button>
                            )}

                            <Button
                                className={"w-full sm:w-1/2"}
                                variant={"destructive"}
                                onClick={() => setCurrentModalIndex(0)}
                            >
                                <span>Sign out everywhere</span>
                                <TriangleAlert aria-label={"Sign out everywhere icon"} />
                            </Button>
                        </div>
                    </div>
                </TitledCard>
            </ContentWrapper>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
