#!/bin/bash
clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "    SaaS VPS MONITOR PRO - INSTALLER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# User Credentials ලබා ගැනීම
read -p "Enter Dashboard Username: " uname
read -p "Enter Dashboard Password: " upass

# Config File එක සෑදීම
echo "{\"username\":\"$uname\", \"password\":\"$upass\"}" > config.json

# Dependencies ස්ථාපනය
echo "Installing Node.js & Dependencies..."
sudo apt update && sudo apt install -y nodejs npm
npm install express socket.io os-utils axios

# PM2 මගින් Run කිරීම
sudo npm install -g pm2
pm2 start server.js --name "vps-monitor"
pm2 save

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SUCCESS! Access your dashboard at:"
echo "http://$(curl -s ifconfig.me):3000"
echo "Username: $uname"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
