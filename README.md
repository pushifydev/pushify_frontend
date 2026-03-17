<div align="center">

# Pushify

An open-source & self-hostable cloud deployment platform.

Deploy apps, manage servers, databases, and domains — all from one dashboard.

![License](https://img.shields.io/badge/license-MIT-22d3ee?style=for-the-badge&labelColor=1a1a2e)
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

## About the Project

Pushify is an open-source platform that lets you deploy and manage your applications on your own servers. Connect your GitHub repos, provision servers, set up databases, configure domains — all through a clean, modern dashboard.

No vendor lock-in. Your servers, your data, your rules.

This repository contains the **frontend dashboard** built with Next.js 15. For the backend API, see [pushify-backend](https://github.com/pushify-dev/pushify-backend).

## Features

- **GitHub Integration** — Connect repos, auto-detect frameworks, deploy on push
- **Server Management** — Provision and manage VPS instances via Hetzner Cloud
- **Database Management** — PostgreSQL, MySQL, Redis, MongoDB with one-click setup
- **Custom Domains** — Automatic SSL via Let's Encrypt
- **Environment Variables** — Per-environment secrets management
- **Real-time Monitoring** — CPU, memory, disk, and network metrics with live charts
- **Team Collaboration** — Role-based access control (owner, admin, member, viewer)
- **AI Assistant** — Built-in AI powered by Claude
- **Activity Logs** — Full audit trail of all actions
- **Health Checks** — Automated endpoint monitoring with alerts
- **Preview Deployments** — Deploy PRs to temporary preview URLs
- **Notifications** — Email, webhook, and Slack alerts
- **Dark & Light Mode** — Professional theme system
- **i18n** — English and Turkish language support

## Getting Started

### Prerequisites

- Node.js 18+
- [Pushify Backend](https://github.com/pushify-dev/pushify-backend) running

### Setup

```bash
git clone https://github.com/pushify-dev/pushify.git
cd pushify
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your account.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api/v1` |

See [.env.example](.env.example) for all available options.

## Tech Stack

| | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS v4 + CSS custom properties |
| **State** | Zustand |
| **Data Fetching** | TanStack React Query |
| **Charts** | Recharts |

## Project Structure

```
app/
├── (auth)/              # Login, register, forgot password
├── (dashboard)/         # Protected dashboard pages
│   └── dashboard/
│       ├── projects/    # Project management & deployments
│       ├── servers/     # Server provisioning & monitoring
│       ├── databases/   # Database management
│       ├── monitoring/  # Real-time metrics
│       ├── team/        # Team & role management
│       ├── billing/     # Plans & usage
│       └── activity/    # Audit logs
├── docs/                # API documentation
└── page.tsx             # Landing page
components/              # Shared UI components
hooks/                   # React Query hooks
lib/                     # API client, constants, utilities
stores/                  # Zustand stores (auth, theme, sidebar)
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
