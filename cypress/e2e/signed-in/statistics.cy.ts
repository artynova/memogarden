import { addHeaderTests } from "cypress/e2e/signed-in/common";
import { userStats } from "cypress/fixtures/user";

describe("Statistics page", () => {
    beforeEach(() => {
        cy.seed(userStats);
        // Delete a card in an existing deck and an entire separate deck to ensure that both still contribute past reviews to the statistics while not contributing to any other metrics
        cy.signinWithCredentials(userStats.email, userStats.password);

        cy.contains("button", /profile/i).click();
        cy.contains("a", /statistics/i).click();
    });

    addHeaderTests(/statistics/i, userStats.avatarId, userStats.retrievabilityPercent);

    describe("given overall view is selected", () => {
        it("should render correct data", () => {
            const maturityCounts = [1, 1, 0, 1, 0, 1]; // In order of ascending maturity enum member indices
            const recentReviewsCounts = [1, 3, 1, 1, 3, 1, 1, 2, 1];
            const scheduledReviewsCounts = [2, 1];

            cy.location("pathname").should("eq", "/statistics");
            cy.location("search").should("eq", "");
            cy.get(".recharts-label-list", { timeout: 8000 }).should("exist"); // Wait for Recharts to finish rendering the charts and their text

            cy.contains("span", /cards: 4/i).should("be.visible");
            cy.contains("span", /reviews: 16/i).should("be.visible");
            cy.contains("span", /lush, 95%/i).should("be.visible");
            cy.contains("h2", /card maturities/i)
                .parent()
                .next()
                .find(".recharts-label-list")
                .last()
                .find("tspan")
                .each((label, index) => {
                    cy.wrap(label).should("contain.text", maturityCounts[index]);
                });

            cy.contains("h2", /recent reviews/i)
                .parent()
                .next()
                .find(".recharts-bar-rectangle")
                .then((bars) => {
                    // Bars that contain a path
                    const nonEmptyBars = bars.filter((index, elem) => {
                        return elem.querySelector("path") !== null;
                    });

                    cy.wrap(nonEmptyBars).should("have.length", recentReviewsCounts.length);
                    cy.wrap(nonEmptyBars).each((bar, index) => {
                        cy.wrap(bar).find("path").first().trigger("mouseover");
                        cy.wait(500);
                        cy.get(".recharts-tooltip-wrapper")
                            .filter(":visible")
                            .first()
                            .contains("span", /^\d+$/i)
                            .should("contain", recentReviewsCounts[index]);
                    });
                });
            cy.contains("h2", /recent reviews/i)
                .parent()
                .next()
                .contains(/total: 14/i)
                .should("be.visible");

            cy.contains("h2", /scheduled reviews/i)
                .parent()
                .next()
                .find(".recharts-bar-rectangle")
                .then((bars) => {
                    // Bars that contain a path
                    const nonEmptyBars = bars.filter((index, elem) => {
                        return elem.querySelector("path") !== null;
                    });

                    cy.wrap(nonEmptyBars).should("have.length", scheduledReviewsCounts.length);
                    cy.wrap(nonEmptyBars).each((bar, index) => {
                        cy.wrap(bar).find("path").first().trigger("mouseover");
                        cy.wait(500);
                        cy.get(".recharts-tooltip-wrapper")
                            .filter(":visible")
                            .last()
                            .contains("span", /^\d+$/i)
                            .should("contain", scheduledReviewsCounts[index]);
                    });
                });
            cy.contains("h2", /scheduled reviews/i)
                .parent()
                .next()
                .contains(/total: 3/i)
                .should("be.visible");
        });
    });

    describe("given specific deck view is selected", () => {
        beforeEach(() => {
            cy.get("button[role='combobox']").click();
            cy.contains("div[role='option']", "German").click();
        });

        it("should render correct data", () => {
            const maturityCounts = [0, 1, 0, 1, 0, 0]; // In order of ascending maturity enum member indices
            const recentReviewsCounts = [1, 3, 1, 1, 1];
            const scheduledReviewsCounts = [1, 1];

            cy.location("pathname").should("eq", "/statistics");
            cy.location("search").should("match", /\?deckId=.*/);
            cy.get(".recharts-label-list", { timeout: 8000 }).should("exist"); // Wait for Recharts to finish rendering the charts and their text

            cy.contains("span", /cards: 2/i).should("be.visible");
            cy.contains("span", /reviews: 7/i).should("be.visible");
            cy.contains("span", /lush, 92%/i).should("be.visible");
            cy.contains("h2", /card maturities/i)
                .parent()
                .next()
                .find(".recharts-label-list")
                .last()
                .find("tspan")
                .each((label, index) => {
                    cy.wrap(label).should("contain.text", maturityCounts[index]);
                });

            cy.contains("h2", /recent reviews/i)
                .parent()
                .next()
                .find(".recharts-bar-rectangle")
                .then((bars) => {
                    // Bars that contain a path
                    const nonEmptyBars = bars.filter((index, elem) => {
                        return elem.querySelector("path") !== null;
                    });

                    cy.wrap(nonEmptyBars).should("have.length", recentReviewsCounts.length);
                    cy.wrap(nonEmptyBars).each((bar, index) => {
                        cy.wrap(bar).find("path").first().trigger("mouseover");
                        cy.wait(500);
                        cy.get(".recharts-tooltip-wrapper")
                            .filter(":visible")
                            .first()
                            .contains("span", /^\d+$/i)
                            .should("contain", recentReviewsCounts[index]);
                    });
                });
            cy.contains("h2", /recent reviews/i)
                .parent()
                .next()
                .contains(/total: 7/i)
                .should("be.visible");

            cy.contains("h2", /scheduled reviews/i)
                .parent()
                .next()
                .find(".recharts-bar-rectangle")
                .then((bars) => {
                    // Bars that contain a path
                    const nonEmptyBars = bars.filter((index, elem) => {
                        return elem.querySelector("path") !== null;
                    });

                    cy.wrap(nonEmptyBars).should("have.length", scheduledReviewsCounts.length);
                    cy.wrap(nonEmptyBars).each((bar, index) => {
                        cy.wrap(bar).find("path").first().trigger("mouseover");
                        cy.wait(500);
                        cy.get(".recharts-tooltip-wrapper")
                            .filter(":visible")
                            .last()
                            .contains("span", /^\d+$/i)
                            .should("contain", scheduledReviewsCounts[index]);
                    });
                });
            cy.contains("h2", /scheduled reviews/i)
                .parent()
                .next()
                .contains(/total: 2/i)
                .should("be.visible");
        });
    });
});
