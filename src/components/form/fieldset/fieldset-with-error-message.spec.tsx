import { FieldsetContext } from "@/components/form/fieldset/context";
import { FieldsetWithErrorMessage } from "@/components/form/fieldset/fieldset-with-error-message";
import { fakeCompliantValue } from "@/test/mock/generic";
import { replaceWithChildren } from "@/test/mock/react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/form/fieldset/context", () => ({ FieldsetContext: { Provider: vi.fn() } }));

const mockedFieldsetContextProvider = vi.mocked(FieldsetContext.Provider);

describe(FieldsetWithErrorMessage, () => {
    beforeEach(() => {
        replaceWithChildren(fakeCompliantValue(mockedFieldsetContextProvider)); // The mock provider, unlike the real one, does not actually require the value prop
    });

    test.each([{ name: "credentials" }, { name: "content" }, { name: "preferences" }])(
        "should render fieldset with correct name given name $name",
        ({ name }) => {
            const { container } = render(
                <FieldsetWithErrorMessage name={name}>Content</FieldsetWithErrorMessage>,
            );
            const fieldset = container.getElementsByTagName("fieldset")[0];

            expect(fieldset).toBeInTheDocument();
            expect(fieldset).toHaveAttribute("name", name);
        },
    );

    test.each([
        { children: <input />, checkTag: "input" },
        {
            children: (
                <div>
                    <input />
                    <select />
                </div>
            ),
            checkTag: "div",
        },
        {
            children: (
                <>
                    <label />
                    <input />
                </>
            ),
            checkTag: "label",
        },
    ])("should render fieldset with correct name given name $name", ({ children, checkTag }) => {
        const { container } = render(
            <FieldsetWithErrorMessage name="">{children}</FieldsetWithErrorMessage>,
        );
        const contentTag = container.getElementsByTagName(checkTag)[0];

        expect(contentTag).toBeInTheDocument();
    });

    test("should mark fieldset as valid for ARIA if there is no error", () => {
        const { container } = render(
            <FieldsetWithErrorMessage name="">Content</FieldsetWithErrorMessage>,
        );
        const fieldset = container.getElementsByTagName("fieldset")[0];

        expect(fieldset).toBeInTheDocument();
        expect(fieldset).toHaveAttribute("aria-invalid", "false");
    });

    test("should not provide any ARIA description for the fieldset if there is no error", () => {
        const { container } = render(
            <FieldsetWithErrorMessage name="">Content</FieldsetWithErrorMessage>,
        );
        const fieldset = container.getElementsByTagName("fieldset")[0];

        expect(fieldset).toBeInTheDocument();
        expect(fieldset).not.toHaveAttribute("aria-describedby");
    });

    test.each([
        { error: "Invalid credentials." },
        { error: "Email or login are incorrect." },
        { error: "Something went wrong." },
    ])("should mark fieldset as invalid for ARIA given error message $error", ({ error }) => {
        const { container } = render(
            <FieldsetWithErrorMessage name="" error={error}>
                Content
            </FieldsetWithErrorMessage>,
        );
        const fieldset = container.getElementsByTagName("fieldset")[0];

        expect(fieldset).toBeInTheDocument();
        expect(fieldset).toHaveAttribute("aria-invalid", "true");
    });

    test.each([
        { error: "Invalid credentials." },
        { error: "Lorem ipsum dolor sit amet." },
        { error: "Something went wrong." },
    ])(
        "should render a description paragraph with the error message and link it to the fieldset given error message $error",
        ({ error }) => {
            const { container } = render(
                <FieldsetWithErrorMessage name="" error={error}>
                    Content
                </FieldsetWithErrorMessage>,
            );
            const fieldset = container.getElementsByTagName("fieldset")[0];
            const paragraph = screen.queryByRole("paragraph");

            expect(fieldset).toBeInTheDocument();
            expect(paragraph).toBeInTheDocument();
            expect(paragraph).toHaveTextContent(error);
            expect(fieldset).toHaveAttribute("aria-describedby", paragraph?.id);
        },
    );

    test.each([
        {},
        { error: "Invalid credentials." },
        { error: "Lorem ipsum dolor sit amet." },
        { error: "Something went wrong." },
    ])(
        "should correctly forward error message to 'FieldsetContext.Provider' given error message $error",
        ({ error }) => {
            render(
                <FieldsetWithErrorMessage name="" error={error}>
                    Content
                </FieldsetWithErrorMessage>,
            );

            expect(mockedFieldsetContextProvider).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ value: { error } }),
                {},
            );
        },
    );
});
