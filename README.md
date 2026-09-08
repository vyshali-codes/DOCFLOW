# DocFlow

A comprehensive cloud-based collaborative document management platform.

## Features
- Real-time collaborative document editing
- Rich text, Markdown, PDF, and MS Office exports
- Folder structure and file management
- Google Workspace integration (Edit in Office)
- Firebase Authentication and Storage

## Requirements
- Node.js (v20+ recommended)
- Firebase Project configured (with Firestore and Storage)
- Google Gen AI (Gemini) API Key

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (check `.env.example`):
   ```bash
   # Add your Gemini API key and other secrets
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at `http://localhost:3000`.

## Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t docflow-app .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -d docflow-app
   ```

For the recommended setup with persistent uploads, use Docker Compose:

```bash
docker compose up --build -d
```

Uploaded files are stored in the `uploads_data` named volume and persist across container restarts.

## Production Build

To build the application for a standard production environment without Docker:

```bash
npm run build
npm start
```
