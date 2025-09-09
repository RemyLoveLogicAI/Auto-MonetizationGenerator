# RRL Demo Portal

This is a lightweight web application that serves as a demo portal for the Reflective Reinforcement Learning (RRL) project. It's built with Hono, a modern web framework for the edge, and is designed to be deployed on Cloudflare Pages.

The portal serves a main page with a project README, a demo video, and a podcast. It also includes an asset library, a CSV explorer, a dashboard viewer, and an admin interface for ingesting files into a Cloudflare R2 bucket.

## Features

-   **Main Page**: Displays the project's `README.md` file, a demo video, and a podcast.
-   **Asset Library**: Lists all available assets from a static manifest and an R2 bucket.
-   **CSV Explorer**: A tool to load, parse, and explore CSV files.
-   **Dashboard Viewer**: Displays a list of HTML-based dashboards.
-   **R2 Integration**: The application can serve files from and ingest files into a Cloudflare R2 bucket.

## Routes

The application has the following routes:

-   `GET /`: The main landing page.
-   `GET /library`: The asset library page.
-   `GET /csv`: The CSV explorer page.
-   `GET /dashboards`: The dashboard viewer page.
-   `GET /admin/ingest`: An admin page for ingesting files into R2.
-   `GET /health`: A health check endpoint that returns the application's status.
-   `GET /static/*`: Serves static files from the `public/static` directory.
-   `GET /api/r2/:key`: A proxy to serve files from the R2 bucket.
-   `GET /api/assets`: An API endpoint that returns a list of all assets.
-   `POST /api/ingestR2`: An API endpoint to ingest a file into R2 from a URL.

## Local Development

To run the application locally, you'll need to have Node.js and npm installed.

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Build the application**:
    This command will run the `gen-version` and `gen-dashboards` scripts, and then build the application with Vite.
    ```bash
    npm run build
    ```

3.  **Start the development server**:
    This command will start a local server using Wrangler, which will serve the built application from the `dist` directory.
    ```bash
    npm run preview
    ```

The application will be available at `http://localhost:8788`.

## Deployment

The application is designed to be deployed on Cloudflare Pages.

1.  **Build the application**:
    ```bash
    npm run build
    ```

2.  **Deploy to Cloudflare Pages**:
    This command will deploy the contents of the `dist` directory to Cloudflare Pages.
    ```bash
    npm run deploy
    ```

## Build Scripts

The project includes two build scripts that are run before the application is built:

-   `scripts/gen-version.cjs`: This script generates a `src/version.ts` file that contains the current git commit SHA and the build time. This information is used by the health check endpoint.
-   `scripts/gen-dashboards.cjs`: This script generates a `public/static/assets/dashboards.json` file that contains a list of all the HTML files in the `public/static/assets` directory. This JSON file is used by the dashboard viewer page.
