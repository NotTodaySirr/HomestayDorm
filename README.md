# HomestayDorm

A Next.js application managing homestays and dormitories, utilizing Prisma ORM, PostgreSQL (via Docker), and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have the following installed to run the application effortlessly:

- **Node.js**: 18.17.0 or later
- **npm**: The package manager for installing dependencies.
- **Docker** & **Docker Compose**: Required to spin up the local PostgreSQL database seamlessly.

## Getting Started

Follow these steps to set up and run the application locally.

### 1. Installation

Clone the repository and navigate into the project directory, then install the required dependencies:

```bash
npm install
```

### 2. Environment Configuration

Because environment variables are kept private, you will need to create a `.env` file at the root of the project.

Create a `.env` file and add the following database connection string:

```env
# Database Connection String
# Matches the credentials configured in docker-compose.yml
DATABASE_URL="postgresql://homestay_user:homestay_password@127.0.0.1:5433/homestaydorm?schema=public"
```

### 3. Database Setup

We use Docker to run the PostgreSQL database locally without needing to install PostgreSQL directly on your machine. 

Start the database container in detached mode:

```bash
docker-compose up -d
```

*(Note: The database runs on port `5433` as configured in `docker-compose.yml` to prevent conflicts with any existing local Postgres instances).*

Wait a few seconds for the database to be ready, then push the database schema, generate the Prisma Client, and seed the initial data:

```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```
*(Alternatively, you can run `npx prisma migrate dev` if you want to track migration history).*

### 4. Running the Development Server

Start the Next.js development server (using Turbopack for faster local development):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the live application. The page is set to auto-update as you edit files, mainly starting in `src/app/page.tsx`.

### 5. Stopping the Database

When you are done developing, you can stop the database container gracefully:

```bash
docker-compose down
```

## Available Scripts

In the project directory, you can run the following commands:

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production usage.
- `npm run start` - Runs the compiled application in production mode.
- `npm run lint` - Runs ESLint to find and fix any linting errors in the codebase.

## Learn More

To learn more about Next.js and Prisma, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Prisma Documentation](https://www.prisma.io/docs/) - learn about Prisma Object-Relational Mapper.
