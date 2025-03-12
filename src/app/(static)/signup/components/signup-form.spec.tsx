import { SignupForm } from "@/app/(static)/signup/components/signup-form";
import { ResponseConflict } from "@/lib/responses";
import { signinWithFacebook, signinWithGoogle, signup } from "@/server/actions/user/actions";
import { CredentialsSignupData } from "@/server/actions/user/schemas";
import { fakeCompliantValue } from "@/test/mock/generic";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/server/actions/user/actions");

const mockedSignup = vi.mocked(signup);
const mockedSigninWithGoogle = vi.mocked(signinWithGoogle);
const mockedSigninWithFacebook = vi.mocked(signinWithFacebook);

/**
 * Simulates a real user inputting given data into a form currently rendered on the screen.
 *
 * @param data Desired input data.
 */
function inputIntoForm(data: Partial<CredentialsSignupData>) {
    const inputEmail = screen.getByRole("textbox", { name: /email/i });
    fireEvent.change(inputEmail, {
        target: { value: data.email },
    });
    const inputPassword = screen.getByLabelText(/^password/i);
    fireEvent.change(inputPassword, {
        target: { value: data.password },
    });
    const inputConfirmPassword = screen.getByLabelText(/confirm password/i);
    fireEvent.change(inputConfirmPassword, {
        target: { value: data.confirmPassword },
    });
}

describe(SignupForm, () => {
    describe("given no form input", () => {
        test("should render empty input fields", () => {
            render(<SignupForm />);
            const inputEmail = screen.getByRole("textbox", { name: /email/i });
            const inputPassword = screen.getByLabelText(/^password/i);
            const inputConfirmPassword = screen.getByLabelText(/confirm password/i);
            const form = inputEmail?.closest("form");

            expect(inputEmail).toBeInTheDocument();
            expect(inputPassword).toBeInTheDocument();
            expect(inputConfirmPassword).toBeInTheDocument();
            expect(form).toHaveFormValues({});
        });

        describe("when sign up button is clicked", () => {
            test("should report missing values", async () => {
                render(<SignupForm />);
                const button = screen.getByRole("button", { name: /sign up/i });
                await userEvent.click(button);
                const inputEmail = screen.getByRole("textbox", { name: /email/i });
                const inputPassword = screen.getByLabelText(/^password/i);
                const inputConfirmPassword = screen.getByLabelText(/confirm password/i);
                const fieldsInOrder = [inputEmail, inputPassword, inputConfirmPassword];
                const errors = screen.getAllByText(/required/i);

                expect(errors.length).toEqual(3);
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
                render(<SignupForm />);
                const button = screen.getByRole("button", { name: /sign up/i });
                await userEvent.click(button);

                expect(mockedSignup).not.toHaveBeenCalled();
            });
        });
    });

    describe.each([
        { password: "a", errorExp: /at least 8/i },
        { password: "aaaaaaa", errorExp: /at least 8/i },
        { password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", errorExp: /at most 32/i },
        { password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", errorExp: /at most 32/i },
        { password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", errorExp: /one uppercase/i },
        { password: "AAAAAAAA", errorExp: /one lowercase/i },
        { password: "aaaaAAAA", errorExp: /one digit/i },
        { password: "aaaaAAA1", errorExp: /one special character/i },
    ])("given invalid form password input $password", ({ password, errorExp }) => {
        describe("when sign up button is clicked", () => {
            test("should report insufficient password strength error", async () => {
                render(<SignupForm />);
                inputIntoForm({ password });
                const button = screen.getByRole("button", { name: /sign up/i });
                await userEvent.click(button);
                const inputPassword = screen.getByLabelText(/^password/i);

                const error = screen.queryByText(errorExp);

                expect(error).toBeInTheDocument();
                expect(error).toHaveClass("text-destructive");
                expect(inputPassword).toHaveAttribute("aria-invalid", "true");
                expect(inputPassword).toHaveAttribute(
                    "aria-describedby",
                    expect.stringContaining(error!.id),
                );
            });

            test("should not submit data", async () => {
                render(<SignupForm />);
                inputIntoForm({ password });
                const button = screen.getByRole("button", { name: /sign up/i });
                await userEvent.click(button);

                expect(mockedSignup).not.toHaveBeenCalled();
            });
        });
    });

    describe.each([
        { password: "a", confirmPassword: "ab" },
        { password: "AAaa11!!", confirmPassword: "AAaa!!11" },
        { password: "AAaa11!!", confirmPassword: "AAaa1!!!" },
    ])(
        "given form password input $password and confirmPassword input $confirmPassword",
        ({ password, confirmPassword }) => {
            describe("when sign up button is clicked", () => {
                test("should report password mismatch error", async () => {
                    render(<SignupForm />);
                    inputIntoForm({ password, confirmPassword });
                    const button = screen.getByRole("button", { name: /sign up/i });
                    await userEvent.click(button);
                    const inputConfirmPassword = screen.getByLabelText(/^confirm password/i);
                    const error = screen.queryByText(/must match/i);

                    expect(error).toBeInTheDocument();
                    expect(error).toHaveClass("text-destructive");
                    expect(inputConfirmPassword).toHaveAttribute("aria-invalid", "true");
                    expect(inputConfirmPassword).toHaveAttribute(
                        "aria-describedby",
                        expect.stringContaining(error!.id),
                    );
                });

                test("should not submit data", async () => {
                    render(<SignupForm />);
                    inputIntoForm({ password, confirmPassword });
                    const button = screen.getByRole("button", { name: /sign up/i });
                    await userEvent.click(button);

                    expect(mockedSignup).not.toHaveBeenCalled();
                });
            });
        },
    );

    describe.each([
        {
            data: {
                email: "agent_smith@example.com",
                password: "PASSWORD_s3cure",
                confirmPassword: "PASSWORD_s3cure",
            },
        },
        {
            data: {
                email: "neo@example.com",
                password: "PASSWORD_s3cure",
                confirmPassword: "PASSWORD_s3cure",
            },
        },
    ])("given valid form input $data", ({ data }) => {
        describe("when sign up button is clicked", () => {
            test("should submit input data and inferred timezone to 'signup' server action", async () => {
                // Fake user timezone inference
                const mockTimezone = "mock_timezone";
                vi.spyOn(Intl, "DateTimeFormat").mockReturnValue(
                    fakeCompliantValue({
                        resolvedOptions: () => ({
                            timeZone: mockTimezone,
                        }),
                    }),
                );

                render(<SignupForm />);
                inputIntoForm(data);
                const button = screen.getByRole("button", { name: /sign up/i });
                await userEvent.click(button);

                expect(mockedSignup).toHaveBeenCalledExactlyOnceWith(data, mockTimezone);
            });

            describe("given server action response notifies about email collision", () => {
                test("should report server-side error", async () => {
                    mockedSignup.mockResolvedValue(ResponseConflict);

                    render(<SignupForm />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /sign up/i });
                    await userEvent.click(button);
                    const inputEmail = screen.getByLabelText(/email/i);
                    const error = screen.queryByText(/already in use/i);

                    expect(error).toBeInTheDocument();
                    expect(inputEmail).toHaveAttribute("aria-invalid", "true");
                    expect(inputEmail).toHaveAttribute(
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
            render(<SignupForm />);
            const continueWithGoogle = screen.queryByRole("button", { name: /google/i });
            if (continueWithGoogle) await userEvent.click(continueWithGoogle);

            expect(continueWithGoogle).toBeInTheDocument();
            expect(mockedSigninWithGoogle).toHaveBeenCalledOnce();
        });
    });

    describe("when 'Continue with Facebook' button is clicked", () => {
        test("should call 'signinWithFacebook' server action", async () => {
            render(<SignupForm />);
            const continueWithFacebook = screen.queryByRole("button", { name: /facebook/i });
            if (continueWithFacebook) await userEvent.click(continueWithFacebook);

            expect(continueWithFacebook).toBeInTheDocument();
            expect(mockedSigninWithFacebook).toHaveBeenCalledOnce();
        });
    });
});
