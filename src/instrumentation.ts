export async function register() {
    // Read and validate environment variables in the server (Node.js) runtime, but not edge (middleware)
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("@/server/env");
    }
}
