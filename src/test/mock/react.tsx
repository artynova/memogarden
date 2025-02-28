import { ReactNode } from "react";
import { MockedFunction } from "vitest";
import { FormField } from "@/components/shadcn/form";
import { fakeCompliantValue } from "@/test/mock/generic";

type MockedComponentWithOptionalChildren = MockedFunction<
    (props: { children?: ReactNode }) => ReactNode
>;
type MockedComponentWithRequiredChildren = MockedFunction<
    (props: { children: ReactNode }) => ReactNode
>;
type MockedComponentWithChildren =
    | MockedComponentWithOptionalChildren
    | MockedComponentWithRequiredChildren;

/**
 * Adds a mock implementation to the provided mocked functional component, returning the component's children without any wrappers.
 * Intended to be used for wrapper components whose functionality is not of interest for a given test.
 *
 * @param mockedComponent Mocked component with children.
 */
export function replaceWithChildren(mockedComponent: MockedComponentWithChildren) {
    mockedComponent.mockImplementation(({ children }) => <>{children ?? null}</>);
}

type MockedFormField = MockedFunction<typeof FormField>;

/**
 * Mocks implementation of {@link FormField} such that the implementation calls the passed render method with a mock `field` object
 * initialized with given values.
 *
 * @param mockedFormField Mocked form field.
 * @param field Basis for field mock (optional, empty object is used if this parameter is not specified).
 */
export function mockFormFieldWithField(mockedFormField: MockedFormField, field: object = {}) {
    mockedFormField.mockImplementation(({ render }) => {
        return render(fakeCompliantValue({ field: fakeCompliantValue(field) }));
    });
}
