import { ChangePasswordForm } from "@/app/(main)/account/components/change-password-form";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ChangePasswordData } from "@/server/actions/user/schemas";
import { changePassword } from "@/server/actions/user/actions";
import { ResponseUnauthorized } from "@/lib/responses";

vi.mock("@/server/actions/user/actions");

const mockedChangePassword = vi.mocked(changePassword);

/**
 * Simulates a real user inputting given data into a form currently rendered on the screen.
 *
 * @param data Desired input data.
 */
function inputIntoForm(data: Partial<ChangePasswordData>) {
    const inputOldPassword = screen.getByLabelText(/^current password/i);
    fireEvent.change(inputOldPassword, {
        target: { value: data.oldPassword },
    });
    const inputPassword = screen.getByLabelText(/^new password/i);
    fireEvent.change(inputPassword, {
        target: { value: data.password },
    });
    const inputConfirmPassword = screen.getByLabelText(/^confirm new password/i);
    fireEvent.change(inputConfirmPassword, {
        target: { value: data.confirmPassword },
    });
}

describe(ChangePasswordForm, () => {
    describe("given form input with no values", () => {
        test("should render empty input fields", () => {
            render(<ChangePasswordForm onCancel={() => {}} />);
            const inputOldPassword = screen.getByLabelText(/^current password/i);
            const inputPassword = screen.getByLabelText(/^new password/i);
            const inputConfirmPassword = screen.getByLabelText(/^confirm new password/i);
            const form = inputOldPassword?.closest("form");

            expect(inputOldPassword).toBeInTheDocument();
            expect(inputPassword).toBeInTheDocument();
            expect(inputConfirmPassword).toBeInTheDocument();
            expect(form).toHaveFormValues({});
        });

        describe("when submit button is clicked", () => {
            test("should report missing values and avoid submitting erroneous data", async () => {
                render(<ChangePasswordForm onCancel={() => {}} />);
                const confirmButton = screen.getByRole("button", { name: /confirm/i });
                fireEvent.click(confirmButton);
                const inputOldPassword = screen.getByLabelText(/^current password/i);
                const inputPassword = screen.getByLabelText(/^new password/i);
                const inputConfirmPassword = screen.getByLabelText(/^confirm new password/i);

                await waitFor(() => {
                    const fieldsInOrder = [inputOldPassword, inputPassword, inputConfirmPassword];
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
                    expect(mockedChangePassword).not.toHaveBeenCalled();
                });
            });
        });

        describe("when cancel button is clicked", () => {
            test("should call the onCancel callback", () => {
                const mockOnCancel = vi.fn();
                render(<ChangePasswordForm onCancel={mockOnCancel} />);
                const cancelButton = screen.getByRole("button", { name: /cancel/i });
                fireEvent.click(cancelButton);

                expect(mockOnCancel).toHaveBeenCalledOnce();
            });
        });
    });

    describe.each([
        {
            data: {
                oldPassword: "s3cure_PASSWORD",
                password: "PASSWORD_s3cure",
                confirmPassword: "PASSWORD_s3cure",
            },
        },
    ])(
        "given valid form old password input $data.oldPassword, password input $data.password, and confirm password input $data.confirmPassword",
        ({ data }) => {
            describe("when submit button is clicked", () => {
                test("should submit input data to the changePassword server action", async () => {
                    render(<ChangePasswordForm onCancel={() => {}} />);
                    inputIntoForm(data);
                    const confirmButton = screen.getByRole("button", { name: /confirm/i });
                    fireEvent.click(confirmButton);

                    await waitFor(() => {
                        expect(mockedChangePassword).toHaveBeenCalledExactlyOnceWith(data);
                    });
                });
                describe("when server action response notifies about incorrect password", () => {
                    test("should report server-side password change error", async () => {
                        mockedChangePassword.mockResolvedValue(ResponseUnauthorized);

                        render(<ChangePasswordForm onCancel={() => {}} />);
                        inputIntoForm(data);
                        const confirmButton = screen.getByRole("button", { name: /confirm/i });
                        fireEvent.click(confirmButton);
                        const inputOldPassword = screen.getByLabelText(/^current password/i);

                        await waitFor(() => {
                            const error = screen.queryByText(/incorrect password/i);

                            expect(error).toBeInTheDocument();
                            expect(inputOldPassword).toHaveAttribute("aria-invalid", "true");
                            expect(inputOldPassword).toHaveAttribute(
                                "aria-describedby",
                                expect.stringContaining(error!.id),
                            );
                            expect(error).toHaveClass("text-destructive");
                        });
                    });
                });
            });

            describe("when cancel button is clicked", () => {
                test("should call the onCancel callback", () => {
                    const mockOnCancel = vi.fn();
                    render(<ChangePasswordForm onCancel={mockOnCancel} />);
                    const cancelButton = screen.getByRole("button", { name: /cancel/i });
                    fireEvent.click(cancelButton);

                    expect(mockOnCancel).toHaveBeenCalledOnce();
                });
            });
        },
    );

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
        test("should report insufficient password strength error", async () => {
            render(<ChangePasswordForm onCancel={() => {}} />);
            inputIntoForm({ password });
            const confirmButton = screen.getByRole("button", { name: /confirm/i });
            fireEvent.click(confirmButton);
            const inputPassword = screen.getByLabelText(/^new password/i);

            await waitFor(() => {
                const error = screen.queryByText(errorExp);

                expect(error).toBeInTheDocument();
                expect(error).toHaveClass("text-destructive");
                expect(inputPassword).toHaveAttribute("aria-invalid", "true");
                expect(inputPassword).toHaveAttribute(
                    "aria-describedby",
                    expect.stringContaining(error!.id),
                );
                expect(mockedChangePassword).not.toHaveBeenCalled();
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
            test("should report password mismatch error", async () => {
                render(<ChangePasswordForm onCancel={() => {}} />);
                inputIntoForm({ password, confirmPassword });
                const confirmButton = screen.getByRole("button", { name: /confirm/i });
                fireEvent.click(confirmButton);
                const inputConfirmPassword = screen.getByLabelText(/^confirm new password/i);

                await waitFor(() => {
                    const error = screen.queryByText(/must match/i);

                    expect(error).toBeInTheDocument();
                    expect(error).toHaveClass("text-destructive");
                    expect(inputConfirmPassword).toHaveAttribute("aria-invalid", "true");
                    expect(inputConfirmPassword).toHaveAttribute(
                        "aria-describedby",
                        expect.stringContaining(error!.id),
                    );
                    expect(mockedChangePassword).not.toHaveBeenCalled();
                });
            });
        },
    );
});
