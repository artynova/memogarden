import { InvalidTokenHandler } from "@/app/(static)/signin/components/invalid-token-handler";
import { INVALID_TOKEN_FLAG, REDIRECT_WITHOUT_TOKEN_TO } from "@/lib/routes";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, waitFor } from "@testing-library/react";
import { signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("next/navigation");
vi.mock("next-auth/react");

const mockedUseSearchParams = vi.mocked(useSearchParams);
const mockedSignOut = vi.mocked(signOut);
const mockedUseRouter = vi.mocked(useRouter);

describe(InvalidTokenHandler, () => {
    const mockRouterReplace = vi.fn();
    const mockParamsHas = vi.fn();

    beforeEach(() => {
        mockedUseRouter.mockReturnValue(fakeCompliantValue({ replace: mockRouterReplace }));
        mockedUseSearchParams.mockReturnValue(fakeCompliantValue({ has: mockParamsHas }));
    });

    test("should trigger sign-out when the invalid token flag is present in page search parameters", () => {
        mockParamsHas.mockImplementation((value: string) => value === INVALID_TOKEN_FLAG);

        render(<InvalidTokenHandler />);

        expect(mockedSignOut).toHaveBeenCalledOnce();
    });

    test("should seamlessly update the URL to remove the invalid token flag after sign-out is completed", async () => {
        mockParamsHas.mockImplementation((value: string) => value === INVALID_TOKEN_FLAG);

        render(<InvalidTokenHandler />);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledExactlyOnceWith(REDIRECT_WITHOUT_TOKEN_TO, {
                scroll: false,
            });
        });
    });

    test("should not trigger sign-out when the invalid token flag is not present in page search parameters", () => {
        mockParamsHas.mockImplementation(() => false);

        render(<InvalidTokenHandler />);

        expect(mockedSignOut).not.toHaveBeenCalled();
    });

    test("should not be rendered in the DOM", () => {
        const { container } = render(<InvalidTokenHandler />);

        expect(container).toBeEmptyDOMElement();
    });
});
