/**
 * Adds tests checking whether the app page header is rendered correctly and supports expected functionality (e.g., navigation to account-related pages).
 *
 * @param title Exact header title or regex to match header title against.
 * @param avatarId Expected avatar ID.
 * @param retrievabilityPercent Fullness percentage for the user's general health bar (from 0 to 100).
 * @param showHomeButton Whether the home button should be shown in the header on the current page (true by default).
 */
export function addHeaderTests(
    title: string | RegExp,
    avatarId: number,
    retrievabilityPercent: number,
    showHomeButton: boolean = true,
) {
    it("should render correct header data", () => {
        cy.get("header").within(() => {
            if (showHomeButton)
                cy.contains("a", /home/i).should("be.visible").and("have.attr", "href", "/home");
            else cy.contains("a", /home/i).should("not.exist");
            cy.contains("h1", title).should("be.visible");
            cy.contains("button", /profile/i).within(() => {
                cy.get("img").should("have.attr", "src", `/avatars/${avatarId}.png`);
                cy.get("[role='progressbar']").should(
                    "have.attr",
                    "aria-valuenow",
                    retrievabilityPercent.toString(),
                );
            });
        });
    });

    if (showHomeButton) {
        it("should allow to navigate to home page via header", () => {
            cy.contains("a", /home/i).click();
            cy.location("pathname").should("eq", "/home");
        });
    }

    it("should allow to navigate to statistics page via header", () => {
        cy.contains("button", /profile/i).click();
        cy.contains("a", /statistics/i).click();

        cy.location("pathname").should("eq", "/statistics");
    });

    it("should allow to navigate to account page via header", () => {
        cy.contains("button", /profile/i).click();
        cy.contains("a", /account/i).click();

        cy.location("pathname").should("eq", "/account");
    });

    it("should allow to sign out via header", () => {
        cy.contains("button", /profile/i).click();
        cy.contains("button", /^sign out$/i).click({ force: true });

        cy.location("pathname").should("eq", "/signin"); // Immediate redirect to sign-in
        cy.visit("/home");
        cy.location("pathname").should("eq", "/signin"); // Redirect to sign-in upon trying to access a protected route, ensuring that the session is terminated
    });
}
