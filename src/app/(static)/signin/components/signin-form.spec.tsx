import { SigninForm } from "@/app/(static)/signin/components/signin-form";
import { ResponseUnauthorized } from "@/lib/responses";
import {
    signinWithCredentials,
    signinWithFacebook,
    signinWithGoogle,
} from "@/server/actions/user/actions";
import { CredentialsSigninData } from "@/server/actions/user/schemas";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
function inputIntoForm(data: CredentialsSigninData) {
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
    test("should render empty input fields initially", () => {
        render(<SigninForm />);
        const inputEmail = screen.queryByRole("textbox", { name: /email/i });
        const inputPassword = screen.queryByLabelText(/password/i); // Password-type fields do not have the standard textbox role
        const form = inputEmail?.closest("form");

        expect(inputEmail).toBeInTheDocument();
        expect(inputPassword).toBeInTheDocument();
        expect(form).toHaveFormValues({});
    });

    test("should submit input data to the 'signinWithCredentials' server action when submit button is clicked and form contains valid data", async () => {
        const target = {
            email: "john_smith@example.com",
            password: "s3cure_PASSWORD",
        };

        render(<SigninForm />);
        inputIntoForm(target);
        const signinButton = screen.getByRole("button", { name: /sign in/i });
        fireEvent.click(signinButton);

        await waitFor(() => {
            expect(mockedSigninWithCredentials).toHaveBeenCalledExactlyOnceWith(target);
        });
    });

    test("should report server-side sign-in error when the server action response notifies about invalid credentials", async () => {
        const target = {
            email: "john_smith@example.com",
            password: "s3cure_PASSWORD",
        };
        mockedSigninWithCredentials.mockResolvedValue(ResponseUnauthorized); // Mock sign-in failure on server

        const { container } = render(<SigninForm />);
        inputIntoForm(target);
        const credentialsFieldset = container.getElementsByTagName("fieldset")[0];
        const signinButton = screen.getByRole("button", { name: /sign in/i });
        fireEvent.click(signinButton);

        await waitFor(() => {
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

    test("should report missing generic field values and avoid submitting erroneous data", async () => {
        render(<SigninForm />);
        const signinButton = screen.getByRole("button", { name: /sign in/i });
        const inputEmail = screen.getByRole("textbox", { name: /email/i });
        const inputPassword = screen.getByLabelText(/password/i);
        fireEvent.click(signinButton);

        await waitFor(() => {
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
            expect(mockedSigninWithCredentials).not.toHaveBeenCalled();
        });
    });

    test("should call the correct server action after the 'Continue with Google' button is clicked", () => {
        render(<SigninForm />);
        const continueWithGoogle = screen.queryByRole("button", { name: /google/i });
        if (continueWithGoogle) fireEvent.click(continueWithGoogle);

        expect(continueWithGoogle).toBeInTheDocument();
        expect(mockedSigninWithGoogle).toHaveBeenCalledOnce();
    });

    test("should call the correct server action after the 'Continue with Facebook' button is clicked", () => {
        render(<SigninForm />);
        const continueWithFacebook = screen.queryByRole("button", { name: /facebook/i });
        if (continueWithFacebook) fireEvent.click(continueWithFacebook);

        expect(continueWithFacebook).toBeInTheDocument();
        expect(mockedSigninWithFacebook).toHaveBeenCalledOnce();
    });
});
