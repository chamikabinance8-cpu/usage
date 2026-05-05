#!/bin/bash
clear
echo "=========================================="
echo "    SaaS VPS MONITOR PRO - INSTALLER"
echo "=========================================="

# 1. User Credentials ලබා ගැනීම
read -p "නව Username එකක් ඇතුළත් කරන්න: " uname
read -p "නව Password එකක් ඇතුළත් කරන්න: " upass

# 2. අවශ්‍ය Tools ස්ථාපනය
sudo apt update && sudo apt install -y nodejs npm git

# 3. Repository එක Clone කිරීම
rm -rf usage
git clone https://github.com/chamikabinance8-cpu/usage.git
cd usage

# 4. Config File එක සෑදීම
echo "{\"username\":\"$uname\", \"password\":\"$upass\"}" > config.json

# 5. Dependencies ස්ථාපනය
npm install express socket.io os-utils axios

# 6. PM2 හරහා Run කිරීම
sudo npm install -g pm2
pm2 delete vps-monitor 2>/dev/null
pm2 start server.js --name "vps-monitor"
pm2 save

# 7. Port Open කිරීම
sudo ufw allow 3000/tcp

echo "=========================================="
echo "✅ සාර්ථකයි! දැන් http://$(curl -s ifconfig.me):3000 හරහා ලොග් වෙන්න."
echo "Username: $uname"
echo "=========================================="
