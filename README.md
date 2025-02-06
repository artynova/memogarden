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
- Card revision with an optional "answer attempt" field for accountability
- Markdown formatting support for card content, as well as a rich editor with Markdown syntax highlighting and a preview
  option
- Visual representation of card maturity, card health, deck health, and overall garden health
- Authentication with email, Google, and Facebook

## Technology Stack

- React
- Next.js
- Tailwind CSS
- ShadcnUI (components imported from its collection are located at `src/components/ui/base`)
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
    3. Obtain and fill in Google and Facebook API IDs and secrets for OAuth sign-in. The values you add do not have to
       be valid if you do not plan on testing the OAuth functionality - the rest of the app will still work
4. Run
    ```bash
    pnpm install
    pnpm run dev
    ```

### Production Version

1. Ensure you have [Docker Compose](https://docs.docker.com/compose) installed and available, e.g., by
   downloading [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Clone the repository and navigate into its folder
3. Create `.env` and fill in the necessary environment variables there. Use `.env.example` for guidance. The process is
   mostly the same as for the `.env.production` file (see development version instructions), but you do not need to specify
   the database host and port because they are managed internally by the Docker Compose application
4. Run
    ```bash
    docker compose up
    ```

## Attribution

- User avatars created based on [Gardener Vectors by Vecteezy](https://www.vecteezy.com/free-vector/gardener)
