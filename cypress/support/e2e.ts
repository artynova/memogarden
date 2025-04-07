import "cypress/support/commands";
import "cypress-real-events/support";

Cypress.on("uncaught:exception", (err) => {
    // Ignore Next.js NEXT_REDIRECT errors
    if (err.message.includes("NEXT_REDIRECT")) {
        return false;
    }
});

beforeEach(() => {
    cy.cleanupDatabase();
    cy.stub(Intl.DateTimeFormat.prototype, "resolvedOptions").callsFake(() => ({
        timeZone: "Europe/Warsaw", // Deterministic time zone inference regardless of device settings
    }));
});

afterEach(() => {
    cy.cleanupDatabase();
});
