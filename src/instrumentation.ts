/**
 * Runs application initialization code (loading environment variables in the Node.js runtime and running database
 * migrations specifically in production).
 */
export async function register() {
    // Read and validate environment variables in the server (Node.js) runtime, but not edge (middleware)
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("@/server/env");
        // Run migrations programmatically when starting in production
        if (process.env.NODE_ENV === "production") {
            const { migrate } = await import("@/server/data/db");
            await migrate();
        }
    }
}
