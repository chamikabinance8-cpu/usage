const express = require('express');
const app = express();
const os = require('os');
const psutil = require('os-utils');
const axios = require('axios');
const { execSync } = require('child_process');

const MASTER_URL = "http://18.143.132.72:4000"; // ඔබේ Master IP එක

function getDiskInfo() {
    try {
        const out = execSync("df -h / --output=size,used,avail,pcent | tail -1").toString().trim().split(/\s+/);
        return { total: out[0], used: out[1], free: out[2], percent: out[3].replace('%', '') };
    } catch (e) {
        return { total: '0G', used: '0G', free: '0G', percent: 0 };
    }
}

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

        // දත්ත Master Server එකට යැවීම
        axios.post(`${MASTER_URL}/update-data`, data)
            .catch(err => console.log("Master Server Not responding..."));
    });
}, 3000);

// Client Web Server Port 3000 (පරිශීලකයන්ට ලොග් වීමට)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect(`${MASTER_URL}/get-ui`);
});

app.listen(3000, () => console.log('Client Node Active on 3000'));
