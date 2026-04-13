#!/bin/bash

# Pull latest changes
git pull origin main

# Restart pm2
pm2 restart bob-dashboard

echo "Dashboard synced and restarted."