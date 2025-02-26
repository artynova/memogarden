import { Footer } from "@/components/page/main/template/footer";
import { FooterAction } from "@/components/page/main/template/footer-action";
import { render } from "@testing-library/react";
import { Eye, Frown, Meh, Plus, Smile, Trash } from "lucide-react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/page/main/template/footer-action");

const mockedFooterAction = vi.mocked(FooterAction);

describe(Footer, () => {
    beforeEach(() => {
        mockedFooterAction.mockImplementation(({ action }) => {
            return <div>{action.text}</div>;
        });
    });

    test("should use semantic footer tag", () => {
        const { container } = render(<Footer actions={[]} />);
        const footers = container.getElementsByTagName("footer");

        expect(footers.length).toEqual(1);
    });

    test("should be an empty element when not given any actions", () => {
        const { container } = render(<Footer actions={[]} />);
        const footer = container.getElementsByTagName("footer")[0];

        expect(footer).toBeEmptyDOMElement();
    });

    test.each([
        {
            actions: [
                { Icon: Trash, text: "Delete", action: "/delete" },
                { Icon: Plus, text: "Create", action: () => {} },
                { Icon: Eye, text: "Overview", action: "/overview" },
            ],
        },
        {
            actions: [
                { Icon: Frown, text: "Bad", action: () => {} },
                { Icon: Meh, text: "Okay", action: () => {} },
                { Icon: Smile, text: "Good", action: () => {} },
            ],
        },
    ])(
        "should correctly forward action properties to 'FooterAction' when given actions $actions",
        ({ actions }) => {
            render(<Footer actions={actions} />);

            actions.forEach((action, index) => {
                expect(mockedFooterAction).toHaveBeenNthCalledWith(
                    index + 1, // The test method uses 1-based indexing for checking mock calls, this is not a mistake
                    expect.objectContaining({ action }),
                    {},
                );
            });
        },
    );
});
