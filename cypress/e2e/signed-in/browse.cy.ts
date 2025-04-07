import { addHeaderTests } from "cypress/e2e/signed-in/common";
import { newCard } from "cypress/fixtures/new-card";
import { newDeck } from "cypress/fixtures/new-deck";
import { userMain } from "cypress/fixtures/user";
import removeMd from "remove-markdown";

describe("Browse page", () => {
    beforeEach(() => {
        cy.seedAndSignin(userMain);
    });

    [
        {
            search: "?page=2&page=5&query=&query=something&deckId=test&deckId=",
            expected: "?page=2",
        },
        { search: "?page=a&query=&deckId=", expected: "" },
        { search: "?page=5&query=&deckId=", expected: "" }, // 5th page does not exist for the seeded data
        { search: "?page=&query=&deckId=", expected: "" },
    ].forEach(({ search, expected }) => {
        it(`should transform malformed search parameters '${search}' into '${expected}'`, () => {
            cy.visit(`/browse${search}`);
            cy.location("search").should("eq", expected);
        });
    });

    describe("given no filters", () => {
        beforeEach(() => {
            cy.visit("/browse");
        });

        addHeaderTests(/search cards/i, userMain.avatarId, userMain.retrievabilityPercent);

        it("should show correct data on all pages", () => {
            cy.contains(/cards found:/i).should("contain", userMain.cardCount);
            cy.get("tr").eq(1).should("contain", "Cześć").and("contain", "Polish");
            cy.get("tr").last().should("contain", "Filler 6").and("contain", "Filler deck");
            cy.contains("button", /previous/i).should("be.disabled");
            cy.contains("a", /next/i).should("be.visible").click();

            cy.location("search").should("eq", "?page=2");
            cy.contains(/cards found:/i).should("contain", userMain.cardCount);
            cy.get("tr").eq(1).should("contain", "Filler 7").and("contain", "Filler deck");
            cy.get("tr").last().should("contain", "Other").and("contain", "Filler deck");
            cy.contains("button", /next/i).should("be.disabled");
            cy.contains("a", /previous/i)
                .should("be.visible")
                .click();

            cy.location("search").should("eq", "");
            cy.get("tr").eq(1).should("contain", "Cześć").and("contain", "Polish");
            cy.get("tr").last().should("contain", "Filler 6").and("contain", "Filler deck");
        });

        it("should allow to create new deck and card", () => {
            cy.get("[role='combobox']").click();
            cy.contains("[role='option']", newDeck.name).should("not.exist");
            cy.findDeck(newDeck.name).should("be.null");
            cy.contains("button", /new deck/i).click({ force: true });
            cy.get("input[name='name']").type(newDeck.name);
            cy.contains("button", /cancel/i).click();
            // No change after cancel
            cy.get("[role='combobox']").click();
            cy.contains("[role='option']", newDeck.name).should("not.exist");
            cy.findDeck(newDeck.name).should("be.null");
            cy.contains("button", /new deck/i).click({ force: true });
            cy.get("input[name='name']").type(newDeck.name);
            cy.contains("button", /save/i).click();
            cy.get("[role='combobox']").click();
            cy.contains("[role='option']", newDeck.name).should("be.visible");
            cy.findDeck(newDeck.name).should("not.be.null");

            cy.contains(/cards found:/i).should("contain", userMain.cardCount);
            cy.contains("tr", removeMd(newCard.front)).should("not.exist");
            cy.findCard(newCard.front, newCard.back).should("be.null");
            cy.contains("button", /new card/i).click({ force: true });
            cy.get("select").select(newDeck.name, { force: true });
            cy.get("[contenteditable]").first().click().realType(newCard.front);
            cy.get("[contenteditable]").last().click().realType(newCard.back);
            cy.contains("button", /cancel/i).click({ force: true });
            // No change after cancel
            cy.contains(/cards found:/i).should("contain", userMain.cardCount);
            cy.contains("tr", removeMd(newCard.front)).should("not.exist");
            cy.findCard(newCard.front, newCard.back).should("be.null");
            cy.contains("button", /new card/i).click();
            cy.get("select").select(newDeck.name, { force: true });
            cy.get("[contenteditable]").first().click().realType(newCard.front);
            cy.get("[contenteditable]").last().click().realType(newCard.back);
            cy.contains("button", /save/i).click();
            cy.contains(/cards found:/i).should("contain", userMain.cardCount + 1);
            cy.contains("tr", removeMd(newCard.front)).should("be.visible");
            cy.findCard(newCard.front, newCard.back).should("not.be.null");
        });

        it("should allow to navigate to card page via table row", () => {
            cy.get("tr").eq(3).click();
            cy.location("pathname").should("match", /\/card\/.*/);
            cy.get("h1").should("contain", "Filler 10");
        });
    });

    describe("given deck and front content filters", () => {
        beforeEach(() => {
            cy.visit("/browse");
            cy.get("input").type("lorem filler");
            cy.get("button[role='combobox']").click();
            cy.contains("div[role='option']", "Filler deck").click();
        });

        addHeaderTests(/search cards/i, userMain.avatarId, userMain.retrievabilityPercent);

        it("should show correct data on all pages", () => {
            cy.location("search").should("match", /^\?query=lorem\+filler&deckId=(.(?!&page=))*$/);
            cy.contains(/cards found:/i).should("contain", userMain.decks[3].cards.length - 1);
            cy.get("tr").eq(1).should("contain", "Filler 1").and("contain", "Filler deck");
            cy.get("tr").last().should("contain", "Filler 7").and("contain", "Filler deck");
            cy.contains("button", /previous/i).should("be.disabled");
            cy.contains("a", /next/i).should("be.visible").click();

            cy.location("search").should("match", /^\?query=lorem\+filler&deckId=.*&page=2$/);
            cy.contains(/cards found:/i).should("contain", userMain.decks[3].cards.length - 1);
            cy.get("tr").eq(1).should("contain", "Filler 8").and("contain", "Filler deck");
            cy.get("tr").last().should("contain", "Filler 9").and("contain", "Filler deck");
            cy.contains("button", /next/i).should("be.disabled");
            cy.contains("a", /previous/i)
                .should("be.visible")
                .click();

            cy.location("search").should("match", /^\?query=lorem\+filler&deckId=(.(?!&page=))*$/);
            cy.get("tr").eq(1).should("contain", "Filler 1").and("contain", "Filler deck");
            cy.get("tr").last().should("contain", "Filler 7").and("contain", "Filler deck");
        });

        it("should allow to navigate to card page via table row", () => {
            cy.get("tr").eq(3).click();
            cy.location("pathname").should("match", /\/card\/.*/);
            cy.get("h1").should("contain", "Filler 11");
        });
    });
});
