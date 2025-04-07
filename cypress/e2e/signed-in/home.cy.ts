import { addHeaderTests } from "cypress/e2e/signed-in/common";
import { newCard } from "cypress/fixtures/new-card";
import { newDeck } from "cypress/fixtures/new-deck";
import { userMain } from "cypress/fixtures/user";

describe("Home page", () => {
    const deck = userMain.decks[0];

    beforeEach(() => {
        cy.seedAndSignin(userMain);
    });

    addHeaderTests(/your garden/i, userMain.avatarId, userMain.retrievabilityPercent, false);

    it("should render correct data", () => {
        cy.contains(/seeds/i).next().should("contain", userMain.new);
        cy.contains(/sprouts/i)
            .next()
            .should("contain", userMain.learning);
        cy.contains(/growing/i)
            .next()
            .should("contain", userMain.review);

        userMain.decks.forEach((deck) => {
            cy.contains("a", deck.name).within(() => {
                cy.contains(/seeds/i).next().should("contain", deck.new);
                cy.contains(/sprouts/i)
                    .next()
                    .should("contain", deck.learning);
                cy.contains(/growing/i)
                    .next()
                    .should("contain", deck.review);
                if (deck.retrievabilityPercent !== null) {
                    cy.root().should("contain", `${deck.retrievabilityPercent}%`);
                    cy.root()
                        .parent()
                        .contains("a", /^review$/i)
                        .should("be.visible");
                    cy.root()
                        .parent()
                        .contains("button", /^review cleared$/i)
                        .should("not.exist");
                } else {
                    cy.root().should("contain", "Not yet planted");
                    cy.root()
                        .parent()
                        .contains("a", /^review$/i)
                        .should("not.exist");
                    cy.root()
                        .parent()
                        .contains("button", /^review cleared$/i)
                        .should("be.visible");
                }
            });
        });
    });

    it("should allow to navigate to deck page", () => {
        cy.contains("a", deck.name).click();

        cy.location("pathname").should("match", /^\/deck\/(.(?!\/review))*$/);
        cy.get("h1").should("contain", deck.name);
    });

    it("should allow to navigate to review page directly", () => {
        cy.contains("a", deck.name)
            .parent()
            .contains("a", /review/i)
            .click();

        cy.location("pathname").should("match", /^\/deck\/.*\/review$/);
        cy.get("h1").should("contain", deck.name);
    });

    it("should allow to navigate to card browse page", () => {
        cy.contains("a", /browse/i).click();

        cy.location("pathname").should("eq", "/browse");
    });

    it("should allow to create new deck and card", () => {
        cy.contains(newDeck.name).should("not.exist");
        cy.findDeck(newDeck.name).should("be.null");
        cy.contains("button", /new deck/i).click();
        cy.get("input[name='name']").type(newDeck.name);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains(newDeck.name).should("not.exist");
        cy.findDeck(newDeck.name).should("be.null");
        cy.contains("button", /new deck/i).click();
        cy.get("input[name='name']").type(newDeck.name);
        cy.contains(/save/i).click();
        cy.contains(newDeck.name).should("exist");
        cy.findDeck(newDeck.name).should("not.be.null");

        cy.contains(/seeds/i).next().should("contain", userMain.new);
        cy.contains(newDeck.name).contains(/seeds/i).next().should("contain", 0);
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("button", /new card/i).click();
        cy.get("select").select(newDeck.name, { force: true });
        cy.get("[contenteditable]").first().click().realType(newCard.front);
        cy.get("[contenteditable]").last().click().realType(newCard.back);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains(/seeds/i).next().should("contain", userMain.new);
        cy.contains(newDeck.name).contains(/seeds/i).next().should("contain", 0);
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("button", /new card/i).click();
        cy.get("select").select(newDeck.name, { force: true });
        cy.get("[contenteditable]").first().click().realType(newCard.front);
        cy.get("[contenteditable]").last().click().realType(newCard.back);
        cy.contains("button", /save/i).click();
        cy.contains(/seeds/i)
            .next()
            .should("contain", userMain.new + 1);
        cy.contains(newDeck.name).contains(/seeds/i).next().should("contain", 1);
        cy.findCard(newCard.front, newCard.back).should("not.be.null");
    });
});
