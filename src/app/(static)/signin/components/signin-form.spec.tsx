import { SigninForm } from "@/app/(static)/signin/components/signin-form";
import { ResponseUnauthorized } from "@/lib/responses";
import {
    signinWithCredentials,
    signinWithFacebook,
    signinWithGoogle,
} from "@/server/actions/user/actions";
import { CredentialsSigninData } from "@/server/actions/user/schemas";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/server/actions/user/actions");

const mockedSigninWithCredentials = vi.mocked(signinWithCredentials);
const mockedSigninWithGoogle = vi.mocked(signinWithGoogle);
const mockedSigninWithFacebook = vi.mocked(signinWithFacebook);

/**
 * Simulates a real user inputting given data into a form currently rendered on the screen.
 *
 * @param data Desired input data.
 */
function inputIntoForm(data: Partial<CredentialsSigninData>) {
    const inputEmail = screen.getByRole("textbox", { name: /email/i });
    fireEvent.change(inputEmail, {
        target: { value: data.email },
    });
    const inputPassword = screen.getByLabelText(/password/i);
    fireEvent.change(inputPassword, {
        target: { value: data.password },
    });
}

describe(SigninForm, () => {
    describe("given no form input", () => {
        test("should render empty input fields", () => {
            render(<SigninForm />);
            const inputEmail = screen.getByRole("textbox", { name: /email/i });
            const inputPassword = screen.getByLabelText(/password/i);
            const form = inputEmail?.closest("form");

            expect(inputEmail).toBeInTheDocument();
            expect(inputPassword).toBeInTheDocument();
            expect(form).toHaveFormValues({});
        });

        describe("when sign in button is clicked", () => {
            test("should report missing values", async () => {
                render(<SigninForm />);
                const button = screen.getByRole("button", { name: /sign in/i });
                await userEvent.click(button);
                const inputEmail = screen.getByRole("textbox", { name: /email/i });
                const inputPassword = screen.getByLabelText(/password/i);
                const fieldsInOrder = [inputEmail, inputPassword];
                const errors = screen.getAllByText(/required/i);

                expect(errors.length).toEqual(2);
                errors.forEach((error, index) => {
                    expect(error).toHaveClass("text-destructive");
                    expect(fieldsInOrder[index]).toHaveAttribute("aria-invalid", "true");
                    expect(fieldsInOrder[index]).toHaveAttribute(
                        "aria-describedby",
                        expect.stringContaining(error.id),
                    );
                });
            });

            test("should not submit data", async () => {
                render(<SigninForm />);
                const button = screen.getByRole("button", { name: /sign in/i });
                await userEvent.click(button);

                expect(mockedSigninWithCredentials).not.toHaveBeenCalled();
            });
        });
    });

    describe.each([
        {
            data: {
                email: "agent_smith@example.com",
                password: "PASSWORD_s3cure",
            },
        },
        {
            data: {
                email: "neo@matrix.com",
                password: "s3cure_PASSWORD",
            },
        },
    ])("given valid form input $data", ({ data }) => {
        describe("when sign in button is clicked", () => {
            test("should submit input data 'signinWithCredentials' server action", async () => {
                render(<SigninForm />);
                inputIntoForm(data);
                const button = screen.getByRole("button", { name: /sign in/i });
                await userEvent.click(button);

                expect(mockedSigninWithCredentials).toHaveBeenCalledExactlyOnceWith(data);
            });

            describe("given server action response notifies about invalid credentials", () => {
                test("should report server-side error", async () => {
                    mockedSigninWithCredentials.mockResolvedValue(ResponseUnauthorized);

                    const { container } = render(<SigninForm />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /sign in/i });
                    await userEvent.click(button);
                    const credentialsFieldset = container.getElementsByTagName("fieldset")[0];

                    const error = screen.queryByText(/incorrect email or password/i);

                    expect(error).toBeInTheDocument();
                    expect(credentialsFieldset).toHaveAttribute("aria-invalid", "true");
                    expect(credentialsFieldset).toHaveAttribute(
                        "aria-describedby",
                        expect.stringContaining(error!.id),
                    );
                    expect(error).toHaveClass("text-destructive");
                });
            });
        });
    });

    describe("when 'Continue with Google' button is clicked", () => {
        test("should call 'signinWithGoogle' server action", async () => {
            render(<SigninForm />);
            const continueWithGoogle = screen.queryByRole("button", { name: /google/i });
            if (continueWithGoogle) await userEvent.click(continueWithGoogle);

            expect(continueWithGoogle).toBeInTheDocument();
            expect(mockedSigninWithGoogle).toHaveBeenCalledOnce();
        });
    });

    describe("when 'Continue with Facebook' button is clicked", () => {
        test("should call 'signinWithFacebook' server action", async () => {
            render(<SigninForm />);
            const continueWithFacebook = screen.queryByRole("button", { name: /facebook/i });
            if (continueWithFacebook) await userEvent.click(continueWithFacebook);

            expect(continueWithFacebook).toBeInTheDocument();
            expect(mockedSigninWithFacebook).toHaveBeenCalledOnce();
        });
    });
});
