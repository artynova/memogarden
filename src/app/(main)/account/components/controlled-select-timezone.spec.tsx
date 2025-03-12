import { ControlledSelectTimezone } from "@/app/(main)/account/components/controlled-select-timezone";
import { ControlledSelect } from "@/components/controlled-select";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render } from "@testing-library/react";
import { useTimezoneSelect } from "react-timezone-select";
import { describe, expect, test, vi } from "vitest";

vi.mock("react-timezone-select");
vi.mock("@/components/controlled-select", () => ({ ControlledSelect: vi.fn() }));

const mockedUseTimezoneSelect = vi.mocked(useTimezoneSelect);
const mockedControlledSelect = vi.mocked(ControlledSelect);

describe(ControlledSelectTimezone, () => {
    test("should create labels for all possible time zones", () => {
        mockedUseTimezoneSelect.mockReturnValue(fakeCompliantValue({ options: [] }));

        render(<ControlledSelectTimezone onValueChange={() => {}} />);

        expect(Object.keys(mockedUseTimezoneSelect.mock.lastCall![0].timezones ?? {})).toEqual(
            expect.arrayContaining(Intl.supportedValuesOf("timeZone")),
        );
    });

    describe.each([
        { options: [] },
        { options: [{ value: "Etc/UTC", label: "UTC" }] },
        {
            options: [
                { value: "America/New_York", label: "Ney York" },
                { value: "Europe/Warsaw", label: "Warsaw" },
            ],
        },
    ])("given 'useTimezoneSelect' returns selection options $options", ({ options }) => {
        test("should forward computed options to base 'ControlledSelect'", () => {
            mockedUseTimezoneSelect.mockReturnValue(fakeCompliantValue({ options }));

            render(<ControlledSelectTimezone onValueChange={() => {}} />);

            expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({ options });
        });
    });
});
