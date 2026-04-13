# Daily Automation

Last updated: 2026-04-13

This document tracks the live daily automations currently operating against the `bob-sec` workstream.

## CVE Daily News Feed
- Owner: Analyst
- Schedule: 6:00 AM America/Phoenix
- Destination: Discord channel `<#1493361414562381844>`
- Purpose: publish the top 3 Critical and top 3 High CVE items from the last 3 days
- Source rules: validate against NVD first, use trending X posts only as fallback

## CVE TLDR Repo Maintenance
- Owner: Engineer
- Schedule: 6:10 AM America/Phoenix
- Source: latest output from the CVE Daily News Feed
- Repo target: `research/cve-tldr/`
- Git behavior:
  - one commit per changed CVE file
  - each commit body includes `Friendly title:` and `Date published:`
  - pushes to GitHub automatically from a clean temp checkout

## Daily Musical Artist
- Owner: Analyst
- Schedule: 8:00 AM America/Phoenix
- Destination: Discord channel `<#1493062864062255175>`
- Purpose: share one niche or esoteric artist and one standout song each day
- Link behavior: uses a durable query-based search link instead of a direct media URL

## Operating Note
These automations are coordinated from OpenClaw, but `bob-sec` is the canonical GitHub record for repo-backed output and supporting documentation.
