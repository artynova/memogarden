import { addHeaderTests } from "cypress/e2e/signed-in/common";
import { newCard } from "cypress/fixtures/new-card";
import { userMain } from "cypress/fixtures/user";
import { ExistingCardSeedData } from "cypress/support";
import removeMd from "remove-markdown";

describe("Single card information page", () => {
    const deck = userMain.decks[0];
    const card = userMain.decks[0].cards[1] as ExistingCardSeedData;
    const otherDeck = userMain.decks[2];

    beforeEach(() => {
        cy.seedAndSignin(userMain);

        cy.contains("a", deck.name).click();
        cy.contains("a", /browse deck cards/i).click();
        cy.contains(removeMd(card.front)).click();
    });

    addHeaderTests(
        removeMd(card.front).slice(0, 7),
        userMain.avatarId,
        userMain.retrievabilityPercent,
    );

    it("should render correct data", () => {
        cy.contains(removeMd(card.front)).should("be.visible");
        cy.contains(removeMd(card.back)).should("be.visible");
        cy.contains(`${card.retrievability * 100}%`).should("be.visible");
    });

    it("should allow to navigate to deck page", () => {
        cy.contains("a", /see deck/i).click();
        cy.get("h1").should("contain", deck.name);
    });

    it("should allow to edit card without changing deck", () => {
        cy.contains(removeMd(card.front)).should("be.visible");
        cy.contains(removeMd(card.back)).should("be.visible");
        cy.contains(removeMd(newCard.front)).should("not.exist");
        cy.contains(removeMd(newCard.back)).should("not.exist");
        cy.findCard(card.front, card.back).should("not.be.null");
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("Edit card").click();
        cy.get("[contenteditable]")
            .first()
            .click()
            .realPress(["Control", "A"]) // Select all current text to type over it
            .realType(newCard.front);
        cy.get("[contenteditable]")
            .last()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.back);
        cy.contains(/cancel/i).click();
        // No change after cancel
        cy.contains(removeMd(card.front)).should("be.visible");
        cy.contains(removeMd(card.back)).should("be.visible");
        cy.contains(removeMd(newCard.front)).should("not.exist");
        cy.contains(removeMd(newCard.back)).should("not.exist");
        cy.findCard(card.front, card.back).should("not.be.null");
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("Edit card").click();
        cy.get("[contenteditable]")
            .first()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.front);
        cy.get("[contenteditable]")
            .last()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.back);
        cy.contains(/save/i).click();
        cy.contains(removeMd(card.front)).should("not.exist");
        cy.contains(removeMd(card.back)).should("not.exist");
        cy.contains(removeMd(newCard.front)).should("be.visible");
        cy.contains(removeMd(newCard.back)).should("be.visible");
        cy.findCard(card.front, card.back).should("be.null");
        cy.findCard(newCard.front, newCard.back).should("not.be.null");
    });

    it("should allow to edit card with changing deck", () => {
        cy.contains(removeMd(card.front)).should("be.visible");
        cy.contains(removeMd(card.back)).should("be.visible");
        cy.contains(removeMd(newCard.front)).should("not.exist");
        cy.contains(removeMd(newCard.back)).should("not.exist");
        cy.findDeck(deck.name)
            .its("id")
            .then((id) => {
                cy.findCard(card.front, card.back).its("deckId").should("eq", id);
            });
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("Edit card").click();
        cy.get("select").select(otherDeck.name, { force: true });
        cy.get("[contenteditable]")
            .first()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.front);
        cy.get("[contenteditable]")
            .last()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.back);
        cy.contains(/cancel/i).click();
        // No change after cancel
        cy.contains(removeMd(card.front)).should("be.visible");
        cy.contains(removeMd(card.back)).should("be.visible");
        cy.contains(removeMd(newCard.front)).should("not.exist");
        cy.contains(removeMd(newCard.back)).should("not.exist");
        cy.findDeck(deck.name)
            .its("id")
            .then((id) => {
                cy.findCard(card.front, card.back).its("deckId").should("eq", id);
            });
        cy.findCard(newCard.front, newCard.back).should("be.null");
        cy.contains("Edit card").click();
        cy.get("select").select(otherDeck.name, { force: true });
        cy.get("[contenteditable]")
            .first()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.front);
        cy.get("[contenteditable]")
            .last()
            .click()
            .realPress(["Control", "A"])
            .realType(newCard.back);
        cy.contains(/save/i).click();
        cy.contains(removeMd(card.front)).should("not.exist");
        cy.contains(removeMd(card.back)).should("not.exist");
        cy.contains(removeMd(newCard.front)).should("be.visible");
        cy.contains(removeMd(newCard.back)).should("be.visible");
        cy.findCard(card.front, card.back).should("be.null");
        cy.findDeck(otherDeck.name)
            .its("id")
            .then((id) => {
                cy.findCard(newCard.front, newCard.back).its("deckId").should("eq", id);
            });
    });

    it("should allow to delete card", () => {
        cy.findCard(card.front, card.back).should("not.be.null");
        cy.contains("button", /delete card/i).click();
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.findCard(card.front, card.back).should("not.be.null");
        cy.contains("button", /delete card/i).click();
        cy.contains("button", /confirm/i).click();
        cy.location("pathname").should("match", /^\/deck\/.*$/); // Assert redirect since card page no longer exists
        cy.get("h1").should("contain", deck.name);
        cy.findCard(card.front, card.back).should("be.null");
    });
});
