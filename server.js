// server.js (Client Node)
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const os = require('os');
const psutil = require('os-utils');
const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MASTER_IP = "18.143.132.72"; // ඔබේ Main VPS IP එක මෙතන දාන්න
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// UI එක Master ගෙන් ලබා ගැනීම
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`http://${MASTER_IP}:4000/get-ui`);
        res.send(response.data);
    } catch (e) {
        res.send("<h1>Connecting to Master... Please Refresh</h1>");
    }
});

function getDiskInfo() {
    try {
        const out = execSync("df -h / --output=size,used,avail,pcent | tail -1").toString().trim().split(/\s+/);
        return { total: out[0], used: out[1], free: out[2], percent: out[3].replace('%', '') };
    } catch (e) {
        return { total: '0G', used: '0G', free: '0G', percent: 0 };
    }
}

const ioObj = require('socket.io')(http);
setInterval(() => {
    psutil.cpuUsage((v) => {
        const disk = getDiskInfo();
        const data = {
            cpu: (v * 100).toFixed(0),
            cores: os.cpus().length,
            ram: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(0),
            totalRam: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + ' GB',
            diskTotal: disk.total,
            diskUsed: disk.used,
            diskFree: disk.free,
            diskPercent: disk.percent,
            hostname: os.hostname(),
            platform: os.type() + ' ' + os.release(),
            uptime: (os.uptime() / 3600).toFixed(1) + ' Hours',
            loadAvg: os.loadavg()[0].toFixed(2)
        };
        ioObj.emit('usageUpdate', data);
    });
}, 2000);

http.listen(3000, () => console.log('Client Running on Port 3000'));
