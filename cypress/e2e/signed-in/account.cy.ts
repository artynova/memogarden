import { addHeaderTests } from "cypress/e2e/signed-in/common";
import { userMain } from "cypress/fixtures/user";

describe("Account page", () => {
    const newPassword = "!!11aaAA";

    beforeEach(() => {
        cy.seedAndSignin(userMain);
        cy.getUser();

        cy.contains("button", /profile/i).click();
        cy.contains("a", /account/i).click();
    });

    addHeaderTests(/account/i, userMain.avatarId, userMain.retrievabilityPercent);

    it("should allow to change theme", () => {
        cy.root().should("not.have.class", "light");
        cy.contains("#theme-dropdown", /light/i).should("not.exist");
        cy.get("#theme-dropdown").click();
        cy.contains(/light/i).click();
        cy.root().should("have.class", "light");
        cy.contains("#theme-dropdown", /light/i).should("be.visible");
    });

    it("should allow to change avatar", () => {
        cy.get("header")
            .contains("button", /profile/i)
            .get("img")
            .as("avatarImg");
        cy.get("@avatarImg").should("have.attr", "src", `/avatars/${userMain.avatarId}.png`);
        cy.contains("button", /next/i).click();
        cy.get("@avatarImg").should("have.attr", "src", `/avatars/${userMain.avatarId}.png`); // There should be no change before the select button is clicked
        cy.contains("button", /^select$/i).click();
        cy.get("@avatarImg").should("have.attr", "src", `/avatars/${userMain.avatarId + 1}.png`); // Adding 1 to ID because next button selects the next avatar in order
    });

    it("should allow to change time zone", () => {
        cy.contains("button", "Europe / Warsaw").should("be.visible");
        cy.contains("button", "America / New York").should("not.exist");
        cy.contains("button", "Europe / Warsaw").click();
        cy.contains("[role='option']", "America / New York").click();
        cy.contains("button", "Europe / Warsaw").should("not.exist");
        cy.contains("button", "America / New York").should("be.visible");

        cy.contains("button", /infer time zone/i).click(); // Test environment ensures that the inferred time zone is Europe/Warsaw
        cy.contains("button", "Europe / Warsaw").should("be.visible");
        cy.contains("button", "America / New York").should("not.exist");
    });

    it("should not allow to change password with incorrect old password", () => {
        cy.contains("button", /change password/i).click();
        cy.get("input[name='oldPassword']").type(userMain.password + "1");
        cy.get("input[name='password']").type(newPassword);
        cy.get("input[name='confirmPassword']").type(newPassword);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains("button", /change password/i).click();
        cy.get("input[name='oldPassword']").type(userMain.password + "1");
        cy.get("input[name='password']").type(newPassword);
        cy.get("input[name='confirmPassword']").type(newPassword);
        cy.contains("button", /confirm/i).click();
        cy.get("form")
            .contains("p", /incorrect password/i)
            .should("be.visible");
    });

    it("should not allow to change password with incorrect old password", () => {
        cy.contains("button", /change password/i).click();
        cy.get("input[name='oldPassword']").type(userMain.password);
        cy.get("input[name='password']").type(newPassword);
        cy.get("input[name='confirmPassword']").type(newPassword);
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains("button", /change password/i).click();
        cy.get("input[name='oldPassword']").type(userMain.password);
        cy.get("input[name='password']").type(newPassword);
        cy.get("input[name='confirmPassword']").type(newPassword);
        cy.contains("button", /confirm/i).click();
        cy.location("pathname").should("eq", "/signin");

        cy.get("input[name='email']").type(userMain.email);
        cy.get("input[name='password']").type(userMain.password);
        cy.contains("button", /sign in/i).click();
        cy.location("pathname").should("eq", "/signin");
        cy.contains("fieldset", /incorrect email or password/i).should("be.visible");

        cy.get("input[name='password']").type("{selectAll}{backspace}" + newPassword); // Delete and rewrite password input since fields are not cleared on failed submission
        cy.contains("button", /sign in/i).click();
        cy.location("pathname").should("eq", "/home");
    });

    it("should allow to forcibly terminate all sessions", () => {
        cy.contains("button", /sign out everywhere/i).click();
        cy.contains("button", /cancel/i).click();
        // No change after cancel
        cy.contains("button", /sign out everywhere/i).click();
        cy.contains("button", /confirm/i).click();

        // Ensure sign-out in main session
        cy.location("pathname").should("eq", "/signin");
        cy.visit("/home");
        cy.location("pathname").should("eq", "/signin");
    });
});
