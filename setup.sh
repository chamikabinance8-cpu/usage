#!/bin/bash

# ඔබේ Dashboard IP එක මෙතන දාන්න
MAIN_SERVER_IP="18.143.132.72"
BASE_URL="http://$MAIN_SERVER_IP:3000"

echo "==================================="
echo "   VPS MONITOR - AUTO TOKEN      "
echo "==================================="
echo "1. Setup Dashboard (Admin Only)"
echo "2. Setup Agent (Add this VPS)"
echo "==================================="
read -p "Option: " choice

if [ "$choice" == "1" ]; then
    sudo apt update && sudo apt install -y nodejs npm
    npm install express socket.io crypto
    sudo npm install -g pm2
    pm2 start server.js --name "vps-monitor"
    echo "✅ Dashboard is live at $BASE_URL"

elif [ "$choice" == "2" ]; then
    sudo apt update && sudo apt install -y python3 python3-pip curl
    pip3 install psutil requests --break-system-packages 2>/dev/null || pip3 install psutil requests

    echo "-----------------------------------"
    read -p "Do you already have a token? (y/n): " has_token

    if [ "$has_token" == "n" ] || [ "$has_token" == "N" ]; then
        echo "Generating new token from server..."
        # සර්වර් එකෙන් අලුත් Token එකක් ලබා ගැනීම
        USER_TOKEN=$(curl -s "$BASE_URL/register" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
        echo "-----------------------------------"
        echo "🔥 YOUR NEW TOKEN: $USER_TOKEN"
        echo "⚠️  Keep this token safe to view your dashboard!"
        echo "-----------------------------------"
    else
        read -p "Enter your existing token: " USER_TOKEN
    fi

    read -p "Enter a name for this VPS (e.g. My-Bot): " vps_id

    # agent.py නිර්මාණය
    cat <<EOF > agent.py
import psutil, requests, time
def send():
    while True:
        try:
            data = {"token": "$USER_TOKEN", "id": "$vps_id", "cpu": psutil.cpu_percent(interval=1), "ram": psutil.virtual_memory().percent}
            requests.post("$BASE_URL/update", json=data, timeout=5)
        except: pass
        time.sleep(2)
if __name__ == "__main__": send()
EOF

    pkill -f agent.py
    nohup python3 agent.py > agent.log 2>&1 &
    echo "✅ Agent is running! Use token $USER_TOKEN to login."
fi
