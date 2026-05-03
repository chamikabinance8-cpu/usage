#!/bin/bash

echo "==================================="
echo "   VPS ALL-IN-ONE MONITOR SETUP    "
echo "==================================="

# 1. Update කර Node.js සහ Git Install කිරීම
echo "Updating packages and installing Node.js..."
sudo apt update -y
sudo apt install -y nodejs npm git

# 2. අවශ්‍ය Packages Install කිරීම
echo "Installing dependencies..."
npm install express socket.io os-utils

# 3. PM2 ස්ථාපනය කිරීම
echo "Installing PM2..."
sudo npm install -g pm2

# 4. server.js ගොනුව PM2 හරහා ධාවනය කිරීම
echo "Starting application with PM2..."
pm2 start server.js --name "vps-monitor"
pm2 save
pm2 startup

# 5. UFW Firewall එකෙන් Port 3000 විවෘත කිරීම
echo "Configuring firewall (UFW)..."
sudo ufw allow 3000/tcp
sudo ufw reload

echo "==================================="
echo "✅ සියල්ල සාර්ථකව ක්‍රියාත්මකයි!"
echo "👉 දැන් ඔබට http://YOUR_VPS_IP:3000 හරහා Dashboard එකට පිවිසිය හැක."
echo "==================================="
