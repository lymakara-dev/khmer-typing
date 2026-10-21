[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/khmer-typing)
<a href='//www.microsoft.com/store/apps/9MZTL2KK24P7?cid=storebadge&ocid=badge'></a>

# khmer-typing

> Learn Khmer Typing with a Visual Keyboard and games

<img width="500" height="363" src="https://raw.githubusercontent.com/passerelles-numeriques/khmer-typing/master/docs/screenshot.png">

A free and open source cross platform and a progressive web application:

- **Live Web Deployment (Cloudflare Workers)**: [https://khmer-typing.lymakara.workers.dev](https://khmer-typing.lymakara.workers.dev)
- Online and PWA (original): https://khmer-typing.passerellesnumeriques.org/
- [Snapcraft](https://snapcraft.io/khmer-typing)
- [Windows Store](https://www.microsoft.com/store/apps/9MZTL2KK24P7)
- Portable Windows Application (see releases tab)
- Linux AppImage (see releases tab)
- Debian/Ubuntu package (see releases tab)
- RPM Package (coming soon)

Khmer Typing is based on VueJS and Electron (for desktop versions). It requires an x64 Operating System with 2GB of RAM.

> [!IMPORTANT]
> **Attribution & Project Credits:**
> All credit for the original **Khmer Typing** application, architecture, visual keyboard engine, and initial design belongs to **[Benjamin BALET](https://github.com/bbalet)** and the team at **[Passerelles Numériques](https://www.passerellesnumeriques.org/)** (original repository: [passerelles-numeriques/khmer-typing](https://github.com/passerelles-numeriques/khmer-typing)).
>
> **My Contribution:**
> In this fork / version, I give full credit to the original creators. My contribution is solely adding the structured curriculum of **42 new Khmer typing lessons** (organized into 16 progressive levels with finger posture guidance, lesson selectors, and smooth progression navigation).

---

## Getting Started

### Prerequisites

- **Node.js**: `v14` (e.g., `v14.21.3`). Using [nvm](https://github.com/nvm-sh/nvm) is recommended because the build stack relies on Webpack 4 and node-sass.
- **Package Manager**: [Yarn](https://classic.yarnpkg.com/) (recommended) or npm.
- **Docker** (optional): for running the containerized web version.

### Installation

1. Switch to Node 14:

   ```bash
   nvm use 14
   # or install if not present:
   # nvm install 14 && nvm use 14
   ```
2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

---

## Running the Website Version

### Option 1: Local Development Server (with Hot Reload)

To start the website in development mode with live reloading:

```bash
yarn dev:web
# or
npm run dev:web
```

Once started, open your browser at **[http://localhost:8081](http://localhost:8081)**.

### Option 2: Docker Container (Production Web)

You can build and run the production web version as an isolated Nginx container:

1. Build the Docker image:

   ```bash
   docker build -t khmer-typing .
   ```
2. Run the container:

   ```bash
   docker run -d --name khmer-typing-web -p 8080:80 khmer-typing
   ```

Once running, access the application in your browser at **[http://localhost:8080](http://localhost:8080)**.

To stop and remove the container:

```bash
docker stop khmer-typing-web && docker rm khmer-typing-web
```

### Option 3: Build Static Web Distribution

To generate static production files without Docker:

```bash
yarn build:web
# or
npm run build:web
```

The compiled SPA bundle will be placed in `./dist/web`. You can host it with any static web server (such as Nginx, Apache, or `npx serve dist/web`).

### Option 4: Deploy to Cloudflare Workers

The project is configured for Cloudflare Workers Static Assets with SPA fallback ([wrangler.json](wrangler.json)).

1. Build the web app:

   ```bash
   yarn build:web
   # or
   npm run build:web
   ```
2. Deploy using Wrangler:

   ```bash
   npm run deploy
   # or
   npx wrangler deploy
   ```

**Live Production URL**: [https://khmer-typing.lymakara.workers.dev](https://khmer-typing.lymakara.workers.dev)

---

## Running the Desktop Version (Electron)

- **Development mode (Desktop GUI + Hot Reload):**

  ```bash
  yarn dev
  # or
  npm run dev
  ```
- **Production build & run:**

  ```bash
  yarn pack
  yarn start
  ```

---

## Credits & Attribution

- **Original Application & Authors**: Created by [**Benjamin BALET**](https://github.com/bbalet) and the development team at [**Passerelles Numériques**](https://www.passerellesnumeriques.org/). All rights and credit for the core application, visual keyboard mechanics, and original software design belong entirely to the original creators.
- **New Lessons Contribution**: The 42 progressive Khmer typing lessons, finger placement guides, and lesson-navigation UI were added in this fork to expand typing education for students and learners.
- **Icon**: by [**icon lauk**](https://www.iconfinder.com/andhikairfani) - Attribution 3.0 Unported (CC BY 3.0)
- **NIDA Keyboard layout**: by [**Kiensvay**](https://commons.wikimedia.org/wiki/File:Khmer_unicode_NiDA_layout.svg) Attribution 3.0 Unported (CC BY 3.0)
- **Original Practice Texts**: Texts in Khmer are an altered copy from [Wapatao website](https://wapatoa.com/km/) with the authorization of the authors.
