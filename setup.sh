#!/bin/bash

echo "==================================="
echo "     Live VPS Monitor Auto Setup   "
echo "==================================="
echo "1. Install Main Dashboard (Server)"
echo "2. Install Monitor Agent (For other VPS)"
echo "==================================="
read -p "ඔබේ තේරීම (1 හෝ 2 ඇතුලත් කරන්න): " choice

if [ "$choice" == "1" ]; then
    echo "Installing Main Server dependencies..."
    sudo apt update && sudo apt install -y nodejs npm
    npm install express socket.io
    sudo npm install -g pm2
    
    echo "Starting Dashboard with PM2..."
    pm2 start server.js --name "vps-dashboard"
    pm2 save
    echo "✅ Dashboard එක සාර්ථකව Run විය! http://YOUR_VPS_IP:3000 වෙත යන්න."

elif [ "$choice" == "2" ]; then
    echo "Installing Python dependencies..."
    sudo apt update && sudo apt install -y python3 python3-pip
    pip3 install psutil requests

    echo ""
    read -p "Main Dashboard එක Run වෙන Server IP එක (උදා: http://192.168.1.1:3000/update): " server_url
    read -p "මෙම VPS එකට ලබාදෙන නම (උදා: Bot-Server-1): " vps_id

    # ස්වයංක්‍රීයව Python file එකේ දත්ත වෙනස් කිරීම
    sed -i "s|SERVER_URL = \"REPLACE_URL\"|SERVER_URL = \"$server_url\"|g" agent.py
    sed -i "s|VPS_ID = \"REPLACE_ID\"|VPS_ID = \"$vps_id\"|g" agent.py

    echo "Starting Agent in background..."
    nohup python3 agent.py > agent.log 2>&1 &
    
    echo "✅ Agent සාර්ථකව Run විය! දැන් Dashboard එක පරීක්ෂා කරන්න."
else
    echo "❌ වැරදි තේරීමක්!"
fi
