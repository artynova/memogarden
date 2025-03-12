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

    describe.each([{ name: "credentials" }, { name: "content" }, { name: "preferences" }])(
        "given name $name",
        ({ name }) => {
            test("should render fieldset with correct name given name $name", () => {
                const { container } = render(
                    <FieldsetWithErrorMessage name={name}>Content</FieldsetWithErrorMessage>,
                );
                const fieldset = container.getElementsByTagName("fieldset")[0];

                expect(fieldset).toBeInTheDocument();
                expect(fieldset).toHaveAttribute("name", name);
            });
        },
    );

    describe.each([
        { children: <input data-testid="children" /> },
        {
            children: (
                <div data-testid="children">
                    <input />
                    <select />
                </div>
            ),
        },
        {
            children: (
                <>
                    <label data-testid="children" />
                    <input />
                </>
            ),
        },
    ])("given children $children", ({ children }) => {
        test("should render children inside fieldset", () => {
            render(<FieldsetWithErrorMessage name="">{children}</FieldsetWithErrorMessage>);
            const contentTag = screen.queryByTestId("children");

            expect(contentTag).toBeInTheDocument();
        });
    });

    describe("given no error", () => {
        test("should mark fieldset as valid for ARIA", () => {
            const { container } = render(
                <FieldsetWithErrorMessage name="">Content</FieldsetWithErrorMessage>,
            );
            const fieldset = container.getElementsByTagName("fieldset")[0];

            expect(fieldset).toBeInTheDocument();
            expect(fieldset).toHaveAttribute("aria-invalid", "false");
        });

        test("should not provide ARIA description", () => {
            const { container } = render(
                <FieldsetWithErrorMessage name="">Content</FieldsetWithErrorMessage>,
            );
            const fieldset = container.getElementsByTagName("fieldset")[0];

            expect(fieldset).toBeInTheDocument();
            expect(fieldset).not.toHaveAttribute("aria-describedby");
            expect(fieldset).not.toHaveAttribute("aria-description");
        });
    });

    describe.each([
        { error: "Invalid credentials." },
        { error: "Email or login are incorrect." },
        { error: "Something went wrong." },
    ])("given error $error", ({ error }) => {
        test("should mark fieldset as invalid for ARIA", () => {
            const { container } = render(
                <FieldsetWithErrorMessage name="" error={error}>
                    Content
                </FieldsetWithErrorMessage>,
            );
            const fieldset = container.getElementsByTagName("fieldset")[0];

            expect(fieldset).toBeInTheDocument();
            expect(fieldset).toHaveAttribute("aria-invalid", "true");
        });

        test("should render fieldset description with error message", () => {
            const { container } = render(
                <FieldsetWithErrorMessage name="" error={error}>
                    Content
                </FieldsetWithErrorMessage>,
            );
            const fieldset = container.getElementsByTagName("fieldset")[0];
            const paragraph = screen.queryByText(error);

            expect(paragraph).toBeInTheDocument();
            expect(paragraph).toHaveTextContent(error);
            expect(fieldset).toHaveAttribute("aria-describedby", paragraph!.id);
        });

        test("should forward error message to 'FieldsetContext.Provider'", () => {
            render(
                <FieldsetWithErrorMessage name="" error={error}>
                    Content
                </FieldsetWithErrorMessage>,
            );

            expect(mockedFieldsetContextProvider).toHaveBeenCalledOnceWithProps({
                value: { error },
            });
        });
    });
});
