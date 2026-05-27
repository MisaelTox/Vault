# 🎮 Vault — Game Discovery App

A full-stack game discovery and personal library app built with React, Node.js, and deployed on AWS with a fully automated CI/CD pipeline.

> App design by **Carlos Almagro (Jedis)**. Infrastructure & DevOps by [Misael Tóxcatl (Tox)](https://github.com/MisaelTox).

---

## 📱 What It Does

Vault lets you search for games using the **IGDB API**, manage a personal collection, and watch official trailers via the **YouTube Data API v3**. The UI is mobile-first with 3D flip-cards and a responsive video player.

---

## 🏗️ Architecture

```
User
 │
 ▼
Elastic IP
 │
 ▼
EC2 t2.micro (Ubuntu 24.04)
 │
 ▼
┌─────────────────────────────┐
│         Docker Compose      │
│                             │
│  ┌──────────┐               │
│  │  Nginx   │ :80           │
│  └────┬─────┘               │
│       │                     │
│  ┌────▼─────┐ ┌──────────┐  │
│  │ Frontend │ │ Backend  │  │
│  │  :80     │ │  :3000   │  │
│  └──────────┘ └────┬─────┘  │
└───────────────────┼─────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
      IGDB API           YouTube API
   (Twitch OAuth2)    (Data API v3)
```

### AWS Resources

| Resource | Details |
|---|---|
| EC2 | t2.micro — Ubuntu 24.04 (Free Tier) |
| Elastic IP | Fixed public IP — survives reboots |
| Security Group | Inbound: 80 (HTTP), 22 (SSH) |

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers an automated deploy via GitHub Actions:

```
git push origin main
        │
        ▼
GitHub Actions (ubuntu-latest)
        │
        ▼
SSH into EC2 (appleboy/ssh-action)
        │
        ▼
git pull origin main
        │
        ▼
docker compose up --build -d
        │
        ▼
App live on EC2
```

### GitHub Secrets required

| Secret | Description |
|---|---|
| `EC2_HOST` | Elastic IP of the EC2 instance |
| `EC2_USER` | SSH user (`ubuntu`) |
| `EC2_SSH_KEY` | Private key for SSH access |
| `ENV_FILE` | Contents of `vault-backend/.env` |

---

## 🛠️ Tech Stack

**Application**
- Backend: Node.js, Express, TypeScript
- Frontend: React 18, Vite, TypeScript, CSS3
- APIs: IGDB (Twitch OAuth2), YouTube Data API v3

**Infrastructure & DevOps**
- Cloud: AWS EC2, Elastic IP, Security Groups
- IaC: Terraform
- Containers: Docker, Docker Compose, Nginx
- CI/CD: GitHub Actions

---

## 🚀 Infrastructure Setup (Terraform)

```bash
cd terraform
terraform init
terraform apply
# Enter your AWS key pair name when prompted
```

Terraform provisions:
- EC2 t2.micro with Docker pre-installed via `user_data`
- Security Group with ports 80 and 22
- Elastic IP attached to the instance

---

## 🔑 Environment Variables

Create `vault-backend/.env` with:

```
YOUTUBE_API_KEY=
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
```

---

## 📂 Project Structure

```
vault/
├── terraform/          # AWS infrastructure (IaC)
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── user_data.sh
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD pipeline
├── nginx/
│   └── nginx.conf      # Reverse proxy config
├── vault-backend/      # Express + TypeScript API
├── vault-frontend/     # React + Vite UI
└── docker-compose.yml
```

---

*Built by [Tox](https://github.com/MisaelTox) & Carlos Almagro (Jedis)*
