"use client";

import { ControlledSelect } from "@/components/controlled-select";
import { useTimezoneSelect } from "react-timezone-select";
import { ComponentProps } from "react";

/**
 * Supported timezones.
 */
const timezones = Object.fromEntries(
    Intl.supportedValuesOf("timeZone")
        .filter((value) => value !== "UTC" && !value.startsWith("Etc/"))
        .map((value) => [value, value.replaceAll("_", " ").replaceAll("/", " / ")]),
);

/**
 * Dropdown timezone selector based on {@link ControlledSelect}.
 *
 * @param props Component properties.
 * @returns The component.
 */
export function ControlledSelectTimezone(
    props: Omit<ComponentProps<typeof ControlledSelect>, "options">,
) {
    const { options } = useTimezoneSelect({ labelStyle: "original", timezones });
    return <ControlledSelect {...props} options={options} />;
}
