import { CardState } from "@/lib/enums";
import { CardSeedData, NewCardSeedData } from "cypress/support";

/**
 * Checks whether given card seed data is for a new card or for an existing card.
 *
 * @param data Card seed data.
 * @returns `true` if the data is for a new card, `false` otherwise.
 */
export function isNewCardSeedData(data: CardSeedData): data is NewCardSeedData {
    return data.stateId === CardState.New;
}

Cypress.Commands.add("cleanupDatabase", () => {
    cy.task("cleanupDatabase");
});

Cypress.Commands.add("createCredentialsUser", (user) => {
    return cy.task("createCredentialsUser", { user });
});

Cypress.Commands.add("signinWithCredentials", (email, password) => {
    cy.visit("/signin");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type(password);
    cy.contains("button", "Sign in").click();
    cy.location("pathname").should("eq", "/home");
});

Cypress.Commands.add("getUser", () => {
    return cy.task("getUser", {});
});

Cypress.Commands.add("createDeck", (userId, deck) => {
    return cy.task("createDeck", { userId, deck });
});

Cypress.Commands.add("findDeck", (name) => {
    return cy.task("findDeck", { name });
});

Cypress.Commands.add("deleteDeck", (id) => {
    return cy.task("deleteDeck", { id });
});

Cypress.Commands.add("createNewCard", (deckId, card) => {
    return cy.task("createNewCard", { deckId, card });
});

Cypress.Commands.add("createCard", (deckId, card) => {
    return cy.task("createCard", {
        deckId,
        card,
    });
});

Cypress.Commands.add("findCard", (front, back) => {
    return cy.task("findCard", { front, back });
});

Cypress.Commands.add("deleteCard", (id) => {
    return cy.task("deleteCard", { id });
});

Cypress.Commands.add("createLogs", (cardId, logs) => {
    return cy.task("createLogs", {
        cardId,
        logs: logs.map((log) => ({ ...log, date: log.date.toISOString() })),
    });
});

Cypress.Commands.add("getLogs", () => {
    return cy.task("getLogs", {});
});

Cypress.Commands.add("syncHealthByCards", (userId) => {
    return cy.task("syncHealthByCards", { userId });
});

Cypress.Commands.add("seed", (user) => {
    return cy.createCredentialsUser(user).then((userId) => {
        return cy
            .wrap(userId)
            .as("userId")
            .then(() => {
                Cypress.Promise.each(user.decks, (deck) =>
                    cy
                        .createDeck(userId, deck)
                        .then((deckId) =>
                            Cypress.Promise.each(deck.cards, (card) =>
                                (isNewCardSeedData(card)
                                    ? cy.createNewCard(deckId, card)
                                    : cy.createCard(deckId, card)
                                ).then((cardId) =>
                                    cy
                                        .createLogs(cardId, card.reviewLogs ?? [])
                                        .then(() =>
                                            card.delete ? cy.deleteCard(cardId) : cy.wrap(null),
                                        ),
                                ),
                            ).then(() => (deck.delete ? cy.deleteDeck(deckId) : cy.wrap(null))),
                        ),
                );
            })
            .get<string>("@userId")
            .then((userId) => cy.syncHealthByCards(userId))
            .get<string>("@userId");
    });
});

Cypress.Commands.add("seedAndSignin", (user) => {
    return cy.seed(user).signinWithCredentials(user.email, user.password).get<string>("@userId");
});
