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

    describe("given empty action list", () => {
        test("should render footer without any children", () => {
            const { container } = render(<Footer actions={[]} />);
            const footer = container.getElementsByTagName("footer")[0];

            expect(footer).toBeEmptyDOMElement();
        });
    });

    describe.each([
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
    ])("given actions $actions", ({ actions }) => {
        describe.each(actions.map((action, index) => ({ action, index })))(
            "for action $action",
            ({ action, index }) => {
                test("should forward action properties to 'FooterAction'", () => {
                    render(<Footer actions={actions} />);

                    expect(mockedFooterAction).toHaveBeenNthCalledWithProps(index + 1, { action });
                });
            },
        );
    });
});
