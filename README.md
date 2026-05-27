<p align="right">
  <b>English</b> | <a href="README_CN.md">中文</a>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&duration=2000&pause=1000&color=5A9E6F&center=true&vCenter=true&width=600&lines=PPTArts+%F0%9F%8E%A8;Enterprise+PPT+Component+Library">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&duration=2000&pause=1000&color=4A7C59&center=true&vCenter=true&width=600&lines=PPTArts+%F0%9F%8E%A8;Enterprise+PPT+Component+Library">
</picture>

<p align="center">
  <b>Stop drawing from scratch</b> · Lego-style building · Ready to use · Team sharing
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Electron-34-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/Tailscale-Funnel-242424?logo=tailscale" alt="Tailscale">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## What is this

The most painful part of making a PowerPoint isn't the lack of ideas — it's having the idea but zero assets. You've got a flowchart in your head, but PowerPoint wants you to draw it from raw rectangles. PPTArts is an **internal company PPT component library** — store all your arrows, icons, illustrations, data cards, and structure templates in one place. Browse by category, search by tag, drag into your slides.

> 🎯 One line: Making slides should feel like LEGO, not like molding plastic from scratch.

---

## ✨ Features

<table>
<tr><td>🗂️ <b>2-Level Category Tree</b></td><td>11 basic element types + 8 structure templates, tree navigation with live counts</td></tr>
<tr><td>🔍 <b>Cross-Category Search</b></td><td>Search by name or tags, 300ms debounce</td></tr>
<tr><td>🖼️ <b>Auto Thumbnails</b></td><td>Import PPTX / PNG / SVG — server generates previews automatically</td></tr>
<tr><td>⬆️ <b>Batch Import</b></td><td>Drag & drop, REST API bulk upload with concurrent processing</td></tr>
<tr><td>📥 <b>One-Click Download</b></td><td>Download original PPTX files straight into your deck</td></tr>
<tr><td>🏷️ <b>Tag System</b></td><td>Color, style, purpose — three dimensions, cross-category filtering</td></tr>
<tr><td>📊 <b>Download Stats</b></td><td>Hot components auto-sorted, instantly see what the team loves</td></tr>
<tr><td>🌐 <b>Web + Desktop</b></td><td>Browser access or Windows EXE — same codebase, two entry points</td></tr>
<tr><td>🔐 <b>JWT Auth</b></td><td>7-day tokens, rate-limited login to prevent brute force</td></tr>
<tr><td>🛡️ <b>Security Hardened</b></td><td>Helmet / CORS / magic byte validation / signed thumbnail URLs / audit logs</td></tr>
<tr><td>🔌 <b>Intranet Penetration</b></td><td>Tailscale Funnel for instant HTTPS, team access from anywhere</td></tr>
<tr><td>📱 <b>Mobile Responsive</b></td><td>Flexible layout — browse and search on your phone browser too</td></tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                   PPTArts                         │
│                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐ │
│  │ Browser  │   │ Electron │   │  Python CLI  │ │
│  │  (Web)   │   │  (EXE)   │   │  (Importer)  │ │
│  └────┬─────┘   └────┬─────┘   └──────┬───────┘ │
│       │              │                 │          │
│       └──────────────┼─────────────────┘          │
│                      │  REST API  :3001           │
│               ┌──────┴──────┐                     │
│               │  Express.js │                     │
│               │  + Helmet   │                     │
│               │  + RateLimit│                     │
│               └──────┬──────┘                     │
│                      │                            │
│          ┌───────────┼───────────┐                │
│     ┌────┴────┐ ┌────┴────┐ ┌───┴────┐          │
│     │ SQLite  │ │ Sharp   │ │ Libre   │          │
│     │ (Data)  │ │(Thumbs) │ │ Office  │          │
│     └─────────┘ └─────────┘ └─────────┘          │
└──────────────────────────────────────────────────┘
```

| Layer | Stack | Notes |
|---|---|---|
| 🖥️ Frontend | React 19 + Ant Design 5 + Zustand | Responsive UI, CSS Grid card layout |
| 🔧 Backend | Express 4 + TypeScript + SQLite | RESTful API, Better-SQLite3 sync perf |
| 📦 Desktop | Electron 34 + Vite | Windows EXE packaging, auto-updater |
| 🐍 Tools | Python 3 (stdlib only) | Bulk import script, zero pip deps |
| 🌐 Tunnel | Tailscale Funnel | Free HTTPS public access |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Fibonaccishen/pptArts.git
cd pptArts
npm install
```

### 2. Start the Server

```bash
cd server
cp .env.example .env    # Edit .env, change JWT_SECRET
npx tsx src/index.ts    # Starts on :3001
```

First run creates an `admin` account (password `admin123`) and the SQLite database.

### 3. Start the Frontend (pick one)

```bash
# Web dev mode (Vite HMR on :5173)
npm -w client run dev

# Package Windows desktop app
npm -w client run build
npx electron-builder --win --x64 --dir
# Output in release/win-unpacked/
```

### 4. Open in Browser

```
http://localhost:3001      # Web (Express serves frontend)
http://localhost:5173      # Dev (Vite + HMR)
```

---

## 📦 Bulk Import Components

PPTArts includes a Python import script for downloading and importing icons/illustrations from npm packages and SVG repositories:

```bash
# 1. Download assets to the staging directory (organized by category)
# 2. Run the import script
python3 ppt-components-downloads/import_to_pptarts.py
```

| Source | Count | License |
|---|---|---|
| 🎨 Manypixels Illustrations | 1,226 | MIT |
| 🏷️ Simple Icons (brands) | 19 (expandable to 3,432) | CC0 |

See [AI-IMPORT-GUIDE.md](docs/AI-IMPORT-GUIDE.md) for the full API documentation.

---

## 📂 Category System

```
Basic Elements (11 types)               Structure Templates (8 types)
├── → Arrows                             ├── ↔ Side-by-Side
├── 👤 Characters                        ├── 🏛️ Architecture
├── 💼 Business                          ├── ⚖️ Comparison
├── 💻 Tech & Digital                    ├── 🔀 Flowchart & Timeline
├── 🌍 Lifestyle                         ├── 🔺 Pyramid
├── ✂️ Dividers & Decorations            ├── 🔄 Cycle
├── ⏳ Transitions                        ├── 🧮 Matrix
├── 📝 Text Boxes                         └── 📊 Infographics
├── 💬 Quote Boxes
├── 🏷️ Labels
└── 📦 Others
```

---

## 🔒 Remote Deployment

Want your team to access PPTArts from outside the office?

```bash
# 1. Configure .env
PUBLIC_MODE=true
CORS_ORIGIN=https://your-machine.tail0771f7.ts.net
JWT_SECRET=your-64-char-random-secret

# 2. Start the server
cd server && npx tsx src/index.ts

# 3. Enable Tailscale Funnel
tailscale funnel 3001
```

Then open `https://your-machine.tail0771f7.ts.net` in a browser. Done.

See [SECURITY-HARDENING.md](docs/SECURITY-HARDENING.md) for the full security checklist.

---

## 🧪 Security Checklist

- [x] ~~Default JWT secret~~ → Random 64-char key enforced
- [x] ~~Open CORS~~ → PUBLIC_MODE origin whitelist
- [x] ~~No rate limiting~~ → Login 10/15min, Import 60/15min
- [x] ~~Stack trace leaks~~ → 500 returns message only
- [x] ~~Public thumbnails~~ → JWT-signed URLs (1h expiry)
- [x] ~~Extension-only validation~~ → Magic byte verification
- [x] ~~No security headers~~ → Helmet (CSP + HSTS + X-Frame + XSS)
- [x] ~~No audit trail~~ → Morgan request logging

---

## 📁 Project Structure

```
pptArts/
├── client/                  # React + Electron frontend
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Shared components (cards, table, nav)
│   │   ├── pages/          # Pages (browse, search, import, manage)
│   │   ├── stores/         # Zustand state management
│   │   └── types/          # TypeScript types
│   ├── electron/           # Electron main process
│   ├── index.html          # Entry HTML + responsive CSS
│   └── vite.config.ts      # Vite + proxy + Electron plugin
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth / upload / error handling
│   │   ├── services/        # Business logic
│   │   ├── db/              # Schema + seed
│   │   └── types/           # TypeScript types
│   └── data/                # SQLite database
├── docs/                    # Documentation
│   ├── PRD-V2.md
│   ├── AI-IMPORT-GUIDE.md
│   └── SECURITY-HARDENING.md
└── ppt-components-downloads/ # Staging area (gitignored)
    └── import_to_pptarts.py  # Bulk import script
```

---

<p align="center">
  <sub>Made with ☕ by someone who was tired of drawing rectangles in PowerPoint</sub>
</p>
