# MemoGarden

A gamified web application for flashcard creation and revision themed around tending to an ethereal mental garden.

## Context

The project is developed for a course at the [International University of Applied Sciences](https://www.iu.org/). The
rationale for choosing this
project topic is as follows: spaced repetition with flashcards is a strong memorization tool, but many conventional
flashcard applications tend to be highly functional and lack motivational aspects, causing some learners to perform
suboptimally; therefore, a relaxing and gamified approach has the potential to enhance the learning experience for many
users.

## Key Features

- Desktop and mobile support
- Management of flashcards and decks
- Card review with an optional "answer attempt" field for accountability
- Markdown formatting support for card content, as well as a rich editor with Markdown syntax highlighting and a preview
  option
- Visual representation of card maturity, card health, deck health, and overall garden health
- Authentication with email, Google, and Facebook

## Technology Stack

- React
- Next.js
- Tailwind CSS
- ShadcnUI (components imported from its collection are located inside `src/components/ui/shadcn`)
- Drizzle ORM
- PostgreSQL

## Running

### Local Development Version

1. Ensure you have [Node.js](https://nodejs.org/en), [pnpm](https://pnpm.io),
   and [PostgreSQL](https://www.postgresql.org) installed
2. Clone the repository and navigate into its folder
3. Create `.env.development` and fill in the necessary environment variables there. Use `.env.development.example` for guidance
    1. Fill in the database connection variables according to your PostgreSQL settings
    2. Fill in the auth secret - a 32-byte base64 number. You can generate one, for example, with OpenSSL by using
        ```bash
        openssl rand -base64 32
        ```
    3. Obtain and fill in Google and Facebook API IDs and secrets for OAuth sign-in. Alternatively, you can insert placeholder values if you do not plan on testing the OAuth functionality - the rest of the app will still work
4. Run the following to install all dependencies
    ```bash
    pnpm install
    ```
5. Run
    ```bash
    pnpm run dev
    ```

### Production Version

1. Ensure you have [Docker Compose](https://docs.docker.com/compose) installed and available, e.g., by
   downloading [Docker Desktop](https://www.docker.com/products/docker-desktop) and opening it
2. Clone the repository and navigate into its folder
3. Create `.env` and fill in the necessary environment variables there. Use `.env.example` for guidance. The process is
   mostly the same as for the `.env.development` file (see development version instructions), but you do not need to specify
   the database host and port because they are managed internally by the Docker Compose application
4. Run
    ```bash
    pnpm run docker:start
    ```
5. The application containers will start in detached mode. To stop them, run
    ```bash
    pnpm run docker:stop
    ```

### Tests

#### Unit Tests

1. Ensure steps 1, 2, and 4 of running the local development version are completed
2. Create `.env.testing` and fill in the necessary environment variables there. Use `.env.testing.example` for guidance. The process is
   mostly the same as for the `.env.development` file (see development version instructions), but you do not need to specify
   the database host.
3. Run
    ```bash
    pnpm run test:unit
    ```

#### End-to-End Tests

1. Ensure steps 1 and 2 of running the production version are completed
2. Ensure step 2 of running the unit tests is completed. Note that the database port in the `.env.testing` file needs to be specified because the Cypress
   test runner uses it to interact with the database directly when setting up test cases. A new containerized database instance will be listening on this
   port, so it should be a vacant port.
3. Run
    ```bash
    pnpm run test:e2e
    ```

#### All Tests

1. Ensure steps 1 and 2 of running unit tests are completed
2. Ensure steps 1 and 2 of running end-to-end tests are completed
3. Run
    ```bash
    pnpm run test
    ```

## Attribution

- User avatars created based on [Gardener Vectors by Vecteezy](https://www.vecteezy.com/free-vector/gardener)
