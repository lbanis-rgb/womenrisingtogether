# Simple login page

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/robert-6270s-projects/v0-mrr-platform-template-to)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/pAAVZ4yxD1w)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/robert-6270s-projects/v0-mrr-platform-template-to](https://vercel.com/robert-6270s-projects/v0-mrr-platform-template-to)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/pAAVZ4yxD1w](https://v0.app/chat/pAAVZ4yxD1w)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## AI Mentor Module integration

The member page at `/members/aimentors` opens the AI Mentor Module library in a signed iframe modal. Configure these Vercel environment variables for each community site:

| Variable | Purpose |
|----------|---------|
| `AI_MENTOR_MODULE_URL` | Base URL for the module (defaults to `https://www.aimentormodule.com`) |
| `AI_MENTOR_MODULE_SITE_KEY` | Site key from AI Mentor Module |
| `AI_MENTOR_MODULE_SIGNING_SECRET` | Site-specific signing secret used server-side to create short-lived launch tokens |

The launch token is generated in `/api/ai-mentors/launch` and includes the member's `plans.id` values from their profile. Never expose `AI_MENTOR_MODULE_SIGNING_SECRET` to the client.

Enable or customize the **AI Mentors** sidebar item under **Admin → Settings → Navigation**.
