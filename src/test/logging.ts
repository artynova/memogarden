import util from "util";
import { vi } from "vitest";

/**
 * Suppresses warning messages with the exact given text when they are printed via {@link console.warn}.
 * Only intended for suppressing fully expected and evaluated warnings, e.g., missing description warnings
 * when element description is intentionally omitted.
 *
 * Suppression functionality is implemented via {@link vi.spyOn}, so mocks need to be restored in order to
 * resume normal warning logging.
 *
 * @param message Exact text of the warning message to be suppressed.
 */
export function suppressWarning(message: string) {
    const originalError = console.error;
    vi.spyOn(console, "warn").mockImplementation((...args: Parameters<typeof console.warn>) => {
        const fullMessage = util.format(...args);
        if (fullMessage === message) {
            return;
        }
        originalError(...args);
    });
}
