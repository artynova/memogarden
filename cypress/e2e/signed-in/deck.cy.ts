import { userMain } from "cypress/fixtures/user";
import { newCard } from "cypress/fixtures/new-card";
import { newDeck } from "cypress/fixtures/new-deck";
import { addHeaderTests } from "cypress/e2e/signed-in/common";

describe("Single deck information page", () => {
    const deck = userMain.decks[0];
    const otherDeck = userMain.decks[2];

    beforeEach(() => {
        cy.seedAndSignin(userMain);

        cy.contains("a", deck.name).click();
    });

    addHeaderTests(deck.name, userMain.avatarId, userMain.retrievabilityPercent);

    it("should render correct data", () => {
        cy.get("h1").should("contain", deck.name);
        cy.contains(/seeds/i).next().should("contain", deck.new);
        cy.contains(/sprouts/i)
            .next()
            .should("contain", deck.learning);
        cy.contains(/growing/i)
            .next()
            .should("contain", deck.review);
        cy.contains("a", /^review$/i).should("be.visible");
        cy.contains("button", /^review cleared$/i).should("not.exist");
    });

    it("should allow to navigate to card browsing page with current deck as filter", () => {
        cy.contains("a", /browse deck cards/i).click();
        cy.location("pathname").should("eq", "/browse");
        cy.get("[role='combobox']").should("contain", deck.name);
    });

    it("should allow to edit deck", () => {
        cy.get("h1").should("not.contain", newDeck.name);
        cy.contains(/edit deck/i).click();
        cy.get("input[name='name']").type("{selectAll}{backspace}" + newDeck.name);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.get("h1").should("not.contain", newDeck.name);
        cy.contains(/edit deck/i).click();
        cy.get("input[name='name']").type("{selectAll}{backspace}" + newDeck.name);
        cy.contains("button", /save/i).click({ force: true });
        cy.get("h1").should("contain", newDeck.name);
    });

    it("should allow to create new card in current deck", () => {
        cy.contains(/seeds/i).next().should("contain", deck.new);
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("button", /new card/i).click();
        cy.get("[contenteditable]").first().click().realType(newCard.front);
        cy.get("[contenteditable]").last().click().realType(newCard.back);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains(/seeds/i).next().should("contain", deck.new);
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("button", /new card/i).click();
        cy.get("[contenteditable]").first().click().realType(newCard.front);
        cy.get("[contenteditable]").last().click().realType(newCard.back);
        cy.contains("button", /save/i).click({ force: true });
        cy.contains(/seeds/i)
            .next()
            .should("contain", deck.new + 1); // Verify that the card was created in the current deck
        cy.findCard(newCard.front, newCard.back).should("not.be.null");
    });

    it("should allow to create new card in another deck", () => {
        cy.contains(/seeds/i).next().should("contain", deck.new);
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("button", /new card/i).click();
        cy.get("select").select(otherDeck.name, { force: true });
        cy.get("[contenteditable]").first().click().realType(newCard.front);
        cy.get("[contenteditable]").last().click().realType(newCard.back);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains(/seeds/i).next().should("contain", deck.new);
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("button", /new card/i).click();
        cy.get("select").select(otherDeck.name, { force: true });
        cy.get("[contenteditable]").first().click().realType(newCard.front);
        cy.get("[contenteditable]").last().click().realType(newCard.back);
        cy.contains("button", /save/i).click({ force: true });
        cy.contains(/seeds/i).next().should("contain", deck.new); // Verify that the new card count in the current deck did not change
        // Verify that the card was created in the target deck via direct database querying
        cy.findCard(newCard.front, newCard.back).should("not.be.null");
    });

    it("should allow to delete deck with all cards", () => {
        cy.findDeck(deck.name).should("not.be.null");
        deck.cards.forEach((card) => {
            cy.findCard(card.front, card.back).should("not.be.null");
        });
        cy.contains("button", /delete deck/i).click();
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.findDeck(deck.name).should("not.be.null");
        deck.cards.forEach((card) => {
            cy.findCard(card.front, card.back).should("not.be.null");
        });
        cy.contains("button", /delete deck/i).click();
        cy.contains("button", /confirm/i).click();
        cy.location("pathname").should("eq", "/home"); // Assert redirect since deck page no longer exists
        cy.findDeck(deck.name).should("be.null");
        deck.cards.forEach((card) => {
            cy.findCard(card.front, card.back).should("be.null");
        });
    });
});
