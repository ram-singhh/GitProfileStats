# GitProfileStats

A lightweight, open‑source service that provides real‑time GitHub statistics as **dynamic SVG cards** and a **React dashboard**. It authenticates users via **GitHub OAuth**, fetches public and private repository data (when a personal access token is provided), and renders customizable cards that can be embedded in READMEs, blogs, or anywhere that accepts SVG images.

---

## Project Badges

[![License](https://img.shields.io/github/license/Ramsingh4656/GitProfileStats)](https://github.com/Ramsingh4656/GitProfileStats/blob/main/LICENSE)
[![Version](https://img.shields.io/github/package-json/v/Ramsingh4656/GitProfileStats)](https://github.com/Ramsingh4656/GitProfileStats/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Ramsingh4656/GitProfileStats/ci.yml?branch=main)](https://github.com/Ramsingh4656/GitProfileStats/actions)
[![Stars](https://img.shields.io/github/stars/Ramsingh4656/GitProfileStats?style=social)](https://github.com/Ramsingh4656/GitProfileStats/stargazers)
[![Forks](https://img.shields.io/github/forks/Ramsingh4656/GitProfileStats?style=social)](https://github.com/Ramsingh4656/GitProfileStats/network/members)
[![Issues](https://img.shields.io/github/issues/Ramsingh4656/GitProfileStats)](https://github.com/Ramsingh4656/GitProfileStats/issues)
[![Last Commit](https://img.shields.io/github/last-commit/Ramsingh4656/GitProfileStats)](https://github.com/Ramsingh4656/GitProfileStats/commits/main)

---

## Features

- **GitHub OAuth** login flow
- **Public & Private Repository** support (via optional GitHub PAT)
- **Dynamic SVG Cards**
  - Profile card (`/cards/profile.svg`)
  - Stats card (`/cards/stats.svg`)
  - Languages card (`/cards/languages.svg`)
  - Streak card (`/cards/streak.svg`)
  - Repository card (`/cards/repository.svg`)
- **Theme Support** – `light`, `dark`, `github`, `dracula`, `nord`
- **Customisation** – theme, accent colour, background, border radius, font family/style
- **Dashboard UI** – responsive, glass‑morphism design, real‑time stats
- **Mock/Demo mode** for offline testing
- **Caching** of SVG responses (default 5 min) to respect GitHub rate limits
- **REST API** – health check, user profile, combined statistics
- **Rate limiting** – applied via Express middleware (helmet, cors, compression)
- **Full TypeScript** codebase with dependency injection (`tsyringe`)
- **Monorepo** managed by Turborepo and pnpm workspaces

---

## Screenshots

> [!NOTE]
> Screenshots are currently unavailable in this documentation.

## Live Demo

- **Frontend** – Deployed on Vercel. Visit the live dashboard to explore statistics and card previews.
- **Backend API** – Deployed on Render. The API serves the SVG endpoints and the combined statistics endpoint.
- **Documentation** – All deployment steps are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Architecture

```mermaid
flowchart TD
    subgraph Frontend[Next.js (Vercel)]
        FE[Dashboard UI]
    end
    subgraph Backend[Express (Render)]
        BE[API Server]
        BE -->|/health| Health[Health Check]
        BE -->|/auth/github| OAuth[GitHub OAuth]
        BE -->|/api/v1/users/me| UserProfile[User Profile]
        BE -->|/api/statistics| Stats[Combined Statistics]
        BE -->|/cards/*.svg| SVG[SVG Card Renderer]
    end
    GitHub[GitHub API] -->|OAuth, Data| OAuth
    GitHub -->|User data| BE
    FE -->|fetch| Backend
    style Frontend fill:#1e3a8a,color:#fff
    style Backend fill:#064e3b,color:#fff
```

---

## Tech Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Frontend       | Next.js (App Router), React 18, Tailwind CSS, TypeScript         |
| Backend        | Express, TypeScript, tsyringe (DI), Helmet, CORS, Compression    |
| Database       | **Neon PostgreSQL** (managed)                                    |
| Cache          | **Upstash Redis** (managed)                                      |
| Authentication | GitHub OAuth (OAuth App)                                         |
| SVG Rendering  | Custom SVG engine using TypeScript (no external image libraries) |
| CI/CD          | GitHub Actions, Vercel (frontend), Render (backend)              |

---

## Folder Structure

```
GitProfileStats/
├─ .editorconfig
├─ .env.example
├─ .gitignore
├─ .husky/
├─ .prettierrc
├─ .turbo/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ app.ts
│  │  │  ├─ cards/
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ profileCard.ts
│  │  │  │  ├─ statsCard.ts
│  │  │  │  ├─ languagesCard.ts
│  │  │  │  ├─ streakCard.ts
│  │  │  │  ├─ repositoryCard.ts
│  │  │  │  └─ engine/
│  │  │  │     ├─ theme.ts
│  │  │  │     └─ types.ts
│  │  │  ├─ config/
│  │  │  │  ├─ env.ts
│  │  │  │  └─ logger.ts
│  │  │  ├─ infrastructure/
│  │  │  │  ├─ http/
│  │  │  │  │  ├─ routes/
│  │  │  │  │  │  ├─ authRoutes.ts
│  │  │  │  │  │  ├─ cardRoutes.ts
│  │  │  │  │  │  ├─ githubRoutes.ts
│  │  │  │  │  │  ├─ index.ts
│  │  │  │  │  │  └─ userRoutes.ts
│  │  │  │  │  ├─ controllers/
│  │  │  │  │  │  ├─ CardController.ts
│  │  │  │  │  │  ├─ AuthController.ts
│  │  │  │  │  │  └─ UserController.ts
│  │  │  │  │  └─ middleware/
│  │  │  │  │     ├─ authGuard.ts
│  │  │  │  │     ├─ cacheMiddleware.ts
│  │  │  │  │     ├─ validation.ts
│  │  │  └─ ...
│  └─ web/
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ dashboard/
│     │  │  └─ login/
│     │  ├─ globals.css
│     │  ├─ layout.tsx
│     │  ├─ page.tsx
│     │  └─ ...
│     ├─ public/
│     └─ ...
├─ CONTRIBUTING.md
├─ DEPLOYMENT.md
├─ LICENSE
├─ README.md
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ramsingh4656/GitProfileStats.git
   cd GitProfileStats
   ```
2. **Install dependencies** (pnpm workspaces)
   ```bash
   pnpm install
   ```
3. **Configure environment variables** – copy the example files and fill in your credentials:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
   Required variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL`
   - `GITHUB_TOKEN` (optional, for private data)
   - `NEXT_PUBLIC_API_URL` (backend URL for the frontend)
4. **Start the backend**
   ```bash
   cd apps/api
   pnpm dev   # runs on http://localhost:4000
   ```
5. **Start the frontend**
   ```bash
   cd ../web
   pnpm dev   # runs on http://localhost:3000
   ```
6. Open `http://localhost:3000` in a browser, log in with GitHub, and explore the dashboard.

---

## Environment Variables

| Variable               | Required                   | Description                                          |
| ---------------------- | -------------------------- | ---------------------------------------------------- |
| `GITHUB_CLIENT_ID`     | Yes                        | OAuth client ID from GitHub App                      |
| `GITHUB_CLIENT_SECRET` | Yes                        | OAuth client secret                                  |
| `GITHUB_CALLBACK_URL`  | Yes                        | Callback URL registered in the GitHub App            |
| `GITHUB_TOKEN`         | No (optional)              | Personal Access Token to access private repositories |
| `WEB_BASE_URL`         | Yes                        | Frontend base URL (used for CORS)                    |
| `NEXT_PUBLIC_API_URL`  | Yes                        | Backend API base URL for the frontend                |
| `PORT`                 | No (default `4000`)        | Port for the Express server                          |
| `NODE_ENV`             | No (default `development`) | Runtime environment                                  |
| `LOG_LEVEL`            | No (default `info`)        | Logging verbosity                                    |

---

## Usage

- **Login** – Click _Login with GitHub_ on the dashboard, grant the requested scopes.
- **Generate cards** – Use the card endpoints, e.g.:
  ```text
  https://<backend-url>/cards/profile.svg?username=your‑github‑name&theme=dark
  https://<backend-url>/cards/stats.svg?username=your‑github‑name&accent=%23ff6600
  ```
- **Preview cards** – The dashboard UI shows live previews for the authenticated user.
- **Copy Markdown** – Click the _Copy Markdown_ button on a card preview to get a ready‑to‑paste snippet:
  ```markdown
  ![GitHub profile](https://<backend-url>/cards/profile.svg?username=your‑github‑name)
  ```
- **Switch themes** – Choose from the built‑in themes (`light`, `dark`, `github`, `dracula`, `nord`) or provide custom colours via query parameters.

---

## SVG Endpoints

| Endpoint                | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| `/cards/profile.svg`    | Render a user profile card                                                 |
| `/cards/stats.svg`      | Render a statistics card (stars, repos, followers, etc.)                   |
| `/cards/languages.svg`  | Top language usage card                                                    |
| `/cards/streak.svg`     | Contribution streak card                                                   |
| `/cards/repository.svg` | Repository information card (requires `owner` and `repo` query parameters) |

All endpoints accept the following optional query parameters for customisation:

- `theme` – theme name (`light`, `dark`, `github`, `dracula`, `nord`)
- `accent` – hex colour for accent elements
- `background` – hex colour for card background
- `border_radius` – integer pixel value
- `hide_border` – `true`/`false`
- `font_family` – custom font family string
- `font_style` – `sans`, `serif`, `mono`, `rounded`
- `mock` – `true` to force mock data (useful for demos)

---

## API Documentation

| Method | Endpoint                              | Description                                               |
| ------ | ------------------------------------- | --------------------------------------------------------- |
| `GET`  | `/health`                             | Simple health‑check, returns `OK`                         |
| `GET`  | `/auth/github`                        | Initiates GitHub OAuth flow                               |
| `GET`  | `/auth/github/callback`               | Handles OAuth callback, issues JWT                        |
| `GET`  | `/api/v1/users/me`                    | Returns authenticated user profile (requires JWT)         |
| `GET`  | `/api/statistics?username={username}` | Returns combined statistics for the given GitHub username |
| `GET`  | `/cards/*`                            | See _SVG Endpoints_ table above                           |

All JSON responses follow the structure:

```json
{ "success": true, "data": { … } }
```

Error responses use `{ "success": false, "error": "Message" }`.

---

## Themes

| Theme     | Preview                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `light`   | ![light](https://raw.githubusercontent.com/Ramsingh4656/GitProfileStats/main/docs/themes/light.png)     |
| `dark`    | ![dark](https://raw.githubusercontent.com/Ramsingh4656/GitProfileStats/main/docs/themes/dark.png)       |
| `github`  | ![github](https://raw.githubusercontent.com/Ramsingh4656/GitProfileStats/main/docs/themes/github.png)   |
| `dracula` | ![dracula](https://raw.githubusercontent.com/Ramsingh4656/GitProfileStats/main/docs/themes/dracula.png) |
| `nord`    | ![nord](https://raw.githubusercontent.com/Ramsingh4656/GitProfileStats/main/docs/themes/nord.png)       |

Custom themes can be created by passing colour overrides via query parameters (`accent`, `background`, `font_family`).

---

## Deployment

All deployment steps are documented in the dedicated guide:

➡️ **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## Development

1. **Run both services locally** (see _Installation_ above).
2. **Hot‑reload** – `pnpm dev` watches source files for both backend and frontend.
3. **Testing** – Run unit and integration tests with:
   ```bash
   pnpm test
   ```
   The test suite covers card rendering, API routes, and service logic.
4. **Linting & Formatting** – Enforced via ESLint and Prettier (`pnpm lint`).

---

## Testing

```bash
# Run the full test suite
pnpm test

# Run only API tests
pnpm test --filter api

# Run only frontend component tests
pnpm test --filter web
```

The CI pipeline runs the test suite on every push.

---

## Performance

- **Caching** – SVG responses are cached for 5 minutes using Upstash Redis.
- **Compression** – `compression` middleware gzips responses.
- **Rate limiting** – Helmet and CORS help mitigate abuse; the GitHub token (if provided) further raises rate limits.
- **Optimised SVG generation** – Minimal DOM manipulation, pure string templates.

---

## Roadmap

- Add **Markdown generator** endpoint for rendering card previews as markdown snippets.
- Support **GitHub Enterprise** hosts.
- Expose **Webhooks** to automatically refresh cached cards on push events.
- Add **CLI** tool for generating cards locally.

---

## Contributing

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to propose changes, report bugs, and submit pull requests.

---

## License

Distributed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Credits

- **Ramsingh4656** – Project author and maintainer
- Inspired by community projects such as **github-readme-stats** and **profile-readme-stats**

---

## Support

- Open an issue on GitHub: [GitProfileStats/issues](https://github.com/Ramsingh4656/GitProfileStats/issues)
- Join the discussion forum: [GitHub Discussions](https://github.com/Ramsingh4656/GitProfileStats/discussions)

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Ramsingh4656/GitProfileStats&type=Date)](https://star-history.com/#Ramsingh4656/GitProfileStats&Date)
