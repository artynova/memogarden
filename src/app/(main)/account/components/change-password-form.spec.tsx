import { ChangePasswordForm } from "@/app/(main)/account/components/change-password-form";

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ChangePasswordData } from "@/server/actions/user/schemas";
import { changePassword } from "@/server/actions/user/actions";
import { ResponseUnauthorized } from "@/lib/responses";
import userEvent from "@testing-library/user-event";

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

        describe("when confirm button is clicked", () => {
            test("should report missing values", async () => {
                render(<ChangePasswordForm onCancel={() => {}} />);
                const button = screen.getByRole("button", { name: /confirm/i });
                await userEvent.click(button);
                const inputOldPassword = screen.getByLabelText(/^current password/i);
                const inputPassword = screen.getByLabelText(/^new password/i);
                const inputConfirmPassword = screen.getByLabelText(/^confirm new password/i);
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
            });

            test("should not submit data", async () => {
                render(<ChangePasswordForm onCancel={() => {}} />);
                const button = screen.getByRole("button", { name: /confirm/i });
                await userEvent.click(button);

                expect(mockedChangePassword).not.toHaveBeenCalled();
            });
        });

        describe("when cancel button is clicked", () => {
            test("should call 'onCancel' callback", async () => {
                const mockOnCancel = vi.fn();
                render(<ChangePasswordForm onCancel={mockOnCancel} />);
                const button = screen.getByRole("button", { name: /cancel/i });
                await userEvent.click(button);

                expect(mockOnCancel).toHaveBeenCalledOnce();
            });

            test("should not submit data", async () => {
                const mockOnCancel = vi.fn();
                render(<ChangePasswordForm onCancel={mockOnCancel} />);
                const button = screen.getByRole("button", { name: /cancel/i });
                await userEvent.click(button);

                expect(mockedChangePassword).not.toHaveBeenCalled();
            });
        });
    });

    describe.each([
        { password: "a", errorExp: /at least 8/i },
        { password: "aaaaaaa", errorExp: /at least 8/i },
        { password: "a".repeat(34), errorExp: /at most 32/i },
        { password: "a".repeat(33), errorExp: /at most 32/i },
        { password: "a".repeat(32), errorExp: /one uppercase/i },
        { password: "AAAAAAAA", errorExp: /one lowercase/i },
        { password: "aaaaAAAA", errorExp: /one digit/i },
        { password: "aaaaAAA1", errorExp: /one special character/i },
    ])("given invalid form password input $password", ({ password, errorExp }) => {
        describe("when confirm button is clicked", () => {
            test("should report insufficient password strength error", async () => {
                render(<ChangePasswordForm onCancel={() => {}} />);
                inputIntoForm({ password });
                const button = screen.getByRole("button", { name: /confirm/i });
                await userEvent.click(button);
                const inputPassword = screen.getByLabelText(/^new password/i);
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
                render(<ChangePasswordForm onCancel={() => {}} />);
                inputIntoForm({ password });
                const button = screen.getByRole("button", { name: /confirm/i });
                await userEvent.click(button);

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
            describe("when confirm button is clicked", () => {
                test("should report password mismatch error", async () => {
                    render(<ChangePasswordForm onCancel={() => {}} />);
                    inputIntoForm({ password, confirmPassword });
                    const button = screen.getByRole("button", { name: /confirm/i });
                    await userEvent.click(button);
                    const inputConfirmPassword = screen.getByLabelText(/^confirm new password/i);
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
                    render(<ChangePasswordForm onCancel={() => {}} />);
                    inputIntoForm({ password, confirmPassword });
                    const button = screen.getByRole("button", { name: /confirm/i });
                    await userEvent.click(button);

                    expect(mockedChangePassword).not.toHaveBeenCalled();
                });
            });
        },
    );

    describe.each([
        {
            data: {
                oldPassword: "s3cure_PASSWORD",
                password: "PASSWORD_s3cure",
                confirmPassword: "PASSWORD_s3cure",
            },
        },
        {
            data: {
                oldPassword: "P4$w0rd",
                password: "P4$w0rd1",
                confirmPassword: "P4$w0rd1",
            },
        },
    ])("given valid form input $data", ({ data }) => {
        describe("when confirm button is clicked", () => {
            test("should submit input data to 'changePassword' server action", async () => {
                render(<ChangePasswordForm onCancel={() => {}} />);
                inputIntoForm(data);
                const button = screen.getByRole("button", { name: /confirm/i });
                await userEvent.click(button);

                expect(mockedChangePassword).toHaveBeenCalledExactlyOnceWith(data);
            });

            describe("given server action response notifies about incorrect current password", () => {
                test("should report server-side error", async () => {
                    mockedChangePassword.mockResolvedValue(ResponseUnauthorized);

                    render(<ChangePasswordForm onCancel={() => {}} />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /confirm/i });
                    await userEvent.click(button);
                    const inputOldPassword = screen.getByLabelText(/^current password/i);

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

        describe("when cancel button is clicked", () => {
            test("should call 'onCancel' callback", async () => {
                const mockOnCancel = vi.fn();

                render(<ChangePasswordForm onCancel={mockOnCancel} />);
                const button = screen.getByRole("button", { name: /cancel/i });
                await userEvent.click(button);

                expect(mockOnCancel).toHaveBeenCalledOnce();
            });

            test("should not submit data", async () => {
                const mockOnCancel = vi.fn();
                render(<ChangePasswordForm onCancel={mockOnCancel} />);
                const button = screen.getByRole("button", { name: /cancel/i });
                await userEvent.click(button);

                expect(mockedChangePassword).not.toHaveBeenCalled();
            });
        });
    });
});
