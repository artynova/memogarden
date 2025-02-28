import { SignupForm } from "@/app/(static)/signup/components/signup-form";
import { ResponseConflict } from "@/lib/responses";
import { signinWithFacebook, signinWithGoogle, signup } from "@/server/actions/user/actions";
import { CredentialsSignupData } from "@/server/actions/user/schemas";
import { fakeCompliantValue } from "@/test/mock/generic";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
function inputIntoForm(data: CredentialsSignupData) {
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
    test("should render empty input fields initially", () => {
        render(<SignupForm />);
        const inputEmail = screen.queryByRole("textbox", { name: /email/i });
        const inputPassword = screen.queryByLabelText(/^password/i); // Password-type fields do not have the standard textbox role
        const inputConfirmPassword = screen.queryByLabelText(/confirm password/i);
        const form = inputEmail?.closest("form");

        expect(inputEmail).toBeInTheDocument();
        expect(inputPassword).toBeInTheDocument();
        expect(inputConfirmPassword).toBeInTheDocument();
        expect(form).toHaveFormValues({});
    });

    test("should submit input data along with inferred timezone to the 'signup' server action when submit button is clicked and form contains valid data", async () => {
        const target = {
            email: "john_smith@example.com",
            password: "s3cure_PASSWORD",
            confirmPassword: "s3cure_PASSWORD",
        };
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
        inputIntoForm(target);
        const signupButton = screen.getByRole("button", { name: /sign up/i });
        fireEvent.click(signupButton);

        await waitFor(() => {
            expect(mockedSignup).toHaveBeenCalledExactlyOnceWith(target, mockTimezone);
        });
    });

    test("should report server-side email error when the server action response notifies about an email collision (i.e., the email is already used by an existing account)", async () => {
        const target = {
            email: "john_smith@example.com",
            password: "s3cure_PASSWORD",
            confirmPassword: "s3cure_PASSWORD",
        };
        mockedSignup.mockResolvedValue(ResponseConflict); // Mock conflict on server

        render(<SignupForm />);
        inputIntoForm(target);
        const inputEmail = screen.getByRole("textbox", { name: /email/i });
        const signupButton = screen.getByRole("button", { name: /sign up/i });
        fireEvent.click(signupButton);

        await waitFor(() => {
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

    test("should report missing generic field values and avoid submitting erroneous data", async () => {
        render(<SignupForm />);
        const signupButton = screen.getByRole("button", { name: /sign up/i });
        const inputEmail = screen.getByRole("textbox", { name: /email/i });
        const inputConfirmPassword = screen.getByLabelText(/confirm password/i);
        fireEvent.click(signupButton);

        await waitFor(() => {
            const fieldsInOrder = [inputEmail, inputConfirmPassword];
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
            expect(mockedSignup).not.toHaveBeenCalled();
        });
    });

    test.each([
        { password: "", errorExp: /at least 8/i },
        { password: "a", errorExp: /at least 8/i },
        { password: "aaaaaaa", errorExp: /at least 8/i },
        { password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", errorExp: /at most 32/i },
        { password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", errorExp: /at most 32/i },
        { password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", errorExp: /one uppercase/i },
        { password: "AAAAAAAA", errorExp: /one lowercase/i },
        { password: "aaaaAAAA", errorExp: /one digit/i },
        { password: "aaaaAAA1", errorExp: /one special character/i },
    ])(
        "should report password failure for input $password with an appropriate error message due to insufficient strength",
        async ({ password, errorExp }) => {
            render(<SignupForm />);
            const inputPassword = screen.getByLabelText(/^password/i);
            fireEvent.change(inputPassword, {
                target: { value: password },
            });
            const signupButton = screen.getByRole("button", { name: /sign up/i });
            fireEvent.click(signupButton);

            await waitFor(() => {
                const error = screen.queryByText(errorExp);

                expect(error).toBeInTheDocument();
                expect(error).toHaveClass("text-destructive");
                expect(inputPassword).toHaveAttribute("aria-invalid", "true");
                expect(inputPassword).toHaveAttribute(
                    "aria-describedby",
                    expect.stringContaining(error!.id),
                );
                expect(mockedSignup).not.toHaveBeenCalled();
            });
        },
    );

    test("should report password mismatch when second password input is not empty and its value does not match the first input", async () => {
        render(<SignupForm />);
        const inputConfirmPassword = screen.getByLabelText(/confirm password/i);
        fireEvent.change(inputConfirmPassword, {
            target: { value: "a" },
        });
        const signupButton = screen.getByRole("button", { name: /sign up/i });
        fireEvent.click(signupButton);

        await waitFor(() => {
            const error = screen.queryByText(/must match/i);

            expect(error).toBeInTheDocument();
            expect(error).toHaveClass("text-destructive");
            expect(inputConfirmPassword).toHaveAttribute("aria-invalid", "true");
            expect(inputConfirmPassword).toHaveAttribute(
                "aria-describedby",
                expect.stringContaining(error!.id),
            );
            expect(mockedSignup).not.toHaveBeenCalled();
        });
    });

    test("should call the correct server action after the 'Continue with Google' button is clicked", () => {
        render(<SignupForm />);
        const continueWithGoogle = screen.queryByRole("button", { name: /google/i });
        if (continueWithGoogle) fireEvent.click(continueWithGoogle);

        expect(continueWithGoogle).toBeInTheDocument();
        expect(mockedSigninWithGoogle).toHaveBeenCalledOnce();
    });

    test("should call the correct server action after the 'Continue with Facebook' button is clicked", () => {
        render(<SignupForm />);
        const continueWithFacebook = screen.queryByRole("button", { name: /facebook/i });
        if (continueWithFacebook) fireEvent.click(continueWithFacebook);

        expect(continueWithFacebook).toBeInTheDocument();
        expect(mockedSigninWithFacebook).toHaveBeenCalledOnce();
    });
});
