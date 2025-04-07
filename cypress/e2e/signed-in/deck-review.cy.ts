import { ReviewRating } from "@/lib/enums";
import { addHeaderTests } from "cypress/e2e/signed-in/common";
import { userMain } from "cypress/fixtures/user";
import removeMd from "remove-markdown";

describe("Single deck review page", () => {
    const deck = userMain.decks[0];
    const firstCard = userMain.decks[0].cards[1]; // First in order of due dates
    const secondCard = userMain.decks[0].cards[0];
    const answer = "test _answer_";

    beforeEach(() => {
        cy.seedAndSignin(userMain);

        cy.contains("a", deck.name)
            .parent()
            .contains("a", /review/i)
            .click();
    });

    describe("given answer is not submitted", () => {
        addHeaderTests(
            new RegExp(`review.*${deck.name}`, "i"),
            userMain.avatarId,
            userMain.retrievabilityPercent,
        );

        describe("given answer is not yet submitted", () => {
            it("should render correct data", () => {
                cy.contains("div", /^question:$/i)
                    .next()
                    .should("contain", removeMd(firstCard.front));
            });

            it("should allow to submit answer", () => {
                cy.get("textarea").type(answer);
                cy.contains("button", /see answer/i).click();
                cy.contains("div", /^your answer:$/i)
                    .next()
                    .should("contain", answer);
            });

            it("should allow to submit no answer", () => {
                cy.contains("button", /see answer/i).click();
                cy.contains("div", /^your answer:$/i)
                    .next()
                    .should("not.contain", answer);
            });
        });
    });

    describe("given answer is submitted", () => {
        beforeEach(() => {
            cy.get("textarea").type(answer);
            cy.contains("button", /see answer/i).click();
        });

        addHeaderTests(
            new RegExp(`review.*${deck.name}`, "i"),
            userMain.avatarId,
            userMain.retrievabilityPercent,
        );

        it("should render correct data", () => {
            cy.contains("div", /^question:$/i)
                .next()
                .should("contain", removeMd(firstCard.front));
            cy.contains("div", /^answer:$/i)
                .next()
                .should("contain", removeMd(firstCard.back));
            cy.contains("div", /^your answer:$/i)
                .next()
                .should("contain", answer);
        });

        [ReviewRating.Again, ReviewRating.Hard, ReviewRating.Good, ReviewRating.Easy].forEach(
            (rating) => {
                it(`should allow to submit review attempt with difficulty rating '${ReviewRating[rating]}'`, () => {
                    cy.getLogs().should("have.length", 0);
                    cy.contains("div", "Question:")
                        .next()
                        .should("contain", removeMd(firstCard.front));
                    cy.contains("button", ReviewRating[rating]).click({ force: true });
                    cy.getLogs()
                        .should("have.length", 1)
                        .its(0)
                        .its("ratingId")
                        .should("eq", rating);
                });
            },
        );
    });

    describe("when last due card is reviewed", () => {
        it("should redirect to deck page", () => {
            cy.location("pathname").should("match", /^\/deck\/.*\/review$/);
            cy.contains("div", "Question:").next().should("contain", removeMd(firstCard.front));
            cy.contains("See answer").click();
            cy.contains("button", ReviewRating[ReviewRating.Easy]).click({ force: true });
            cy.location("pathname").should("match", /^\/deck\/.*\/review$/);
            cy.contains("div", "Question:").next().should("contain", removeMd(secondCard.front));
            cy.contains("See answer").click();
            cy.contains("button", ReviewRating[ReviewRating.Easy]).click({ force: true });
            cy.location("pathname").should("match", /^\/deck\/.*$/);
        });
    });
});
