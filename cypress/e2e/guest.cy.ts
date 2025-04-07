import { userMain } from "cypress/fixtures/user";

describe("Guest functionality", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    describe("given guest is not signed up", () => {
        it("should allow to sign up with credentials and sign in", () => {
            cy.contains("a", /sign up/i)
                .first()
                .click();

            cy.location("pathname").should("eq", "/signup");

            cy.get("input[name='email']").type(userMain.email);
            cy.get("input[name='password']").type(userMain.password);
            cy.get("input[name='confirmPassword']").type(userMain.password);
            cy.contains("button", /sign up/i).click();

            cy.location("pathname").should("eq", "/signin");
            cy.get("input[name='email']").type(userMain.email);
            cy.get("input[name='password']").type(userMain.password);
            cy.contains("button", /sign in/i).click();

            cy.location("pathname").should("eq", "/home");
        });
    });

    describe("given guest is signed up", () => {
        beforeEach(() => {
            cy.createCredentialsUser(userMain);
        });

        it("should allow to sign in with correct credentials", () => {
            cy.contains("a", /sign in/i)
                .first()
                .click();

            cy.location("pathname").should("eq", "/signin");
            cy.get("input[name='email']").type(userMain.email);
            cy.get("input[name='password']").type(userMain.password);
            cy.contains("button", /sign in/i).click();

            cy.location("pathname").should("eq", "/home");
        });

        it("should not allow to sign in with incorrect credentials", () => {
            cy.contains("a", /sign in/i)
                .first()
                .click();

            cy.location("pathname").should("eq", "/signin");
            cy.get("input[name='email']").type(userMain.email);
            cy.get("input[name='password']").type(userMain.password + "1");
            cy.contains("button", /sign in/i).click();

            cy.location("pathname").should("eq", "/signin");
            cy.contains("fieldset", /incorrect email or password/i).should("be.visible");
        });
    });
});
