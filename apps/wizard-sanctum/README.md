# Wizard's Sanctum

## Overview
Wizard's Sanctum is a gamified control panel for managing OpenClaw agents and creating new features. It presents a 2D top-down RuneScape-style magical world where productivity tasks are interfaced through lore, spells, rooms, and characters. This tool blends fun, intuitive gameplay with enterprise-level productivity, security, and compliance.

Built for leverage, autonomy, security, business building, and outdoor planning, it ensures that every interaction leads to tangible outcomes.

## Vision
- **Core Philosophy**: Accessible to young contributors (12-15 years old) for real enterprise work through playful mechanics.
- **Interface**: 2D world with rooms like Wizard Office, Oracle Chamber, Sanctum of Restoration, etc.
- **Characters**: The Wise One (context-holding NPC), Familiars, Dragons (e.g., Archive Dragon).
- **Mechanics**: Spells (e.g., Arcane Audit for vulnerability scanning), Gamification (reputation, quests), Voice commands.
- **Integrations**: GitHub, security tools, AI models via MCP Server.
- **Technical**: Mobile-first, offline-capable, compliant with HIPAA, PCI-DSS, etc.

Full requirements and vision are detailed in the project's documentation (see /tmp/wizard.md for initial spec).

## Getting Started
This project is under development. Once set up:

```bash
cd wizard-sanctum
npm install
npm run dev
```

Open http://localhost:3000 to access the app.

The hosted version will be available at https://claw.local/wizard.

## Development
- **Frontend**: Next.js with Phaser.js for 2D world.
- **Backend**: FastAPI or similar.
- **Deployment**: Dockerized for local hosting.

Contributions welcome! See the full spec for features to implement.

Last updated: April 12, 2026
