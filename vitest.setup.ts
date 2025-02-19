import "@/scripts/load-test-env";
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
    vi.resetAllMocks();
    cleanup();
});
