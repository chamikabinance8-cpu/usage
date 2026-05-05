const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');

app.use(cors());

// Global variable එකක් මගින් දත්ත ගබඩා කිරීම
let latestVpsData = {
    cpu: 0, cores: 0, ram: 0, totalRam: '0 GB',
    diskTotal: '0G', diskUsed: '0G', diskFree: '0G', diskPercent: 0,
    hostname: '-', platform: '-', uptime: '-', loadAvg: '0'
};

// Client Nodes වලින් දත්ත ලබා ගන්නා API එක
app.use(express.json());
app.post('/update-data', (req, res) => {
    latestVpsData = req.body;
    // UI එකට දත්ත Emit කිරීම
    io.emit('usageUpdate', latestVpsData);
    res.status(200).send("Updated");
});

app.get('/get-ui', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SaaS VPS Pro Monitor</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    </head>
    <body class="bg-[#0b0f1a] text-white p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 class="text-3xl font-black text-blue-500 uppercase tracking-widest">SaaS VPS MONITOR <span class="text-xs bg-blue-600 text-white px-2 py-1 rounded ml-2">PRO</span></h1>
                    <p class="text-gray-500 text-sm">Real-time Cloud Node Intelligence</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <p class="text-gray-500 text-xs font-bold uppercase mb-4">Processor</p>
                    <h2 id="cpu-percent" class="text-5xl font-black mb-2">0%</h2>
                    <div class="w-full bg-slate-950 h-1.5 rounded-full mb-4">
                        <div id="cpu-bar" class="h-1.5 rounded-full bg-blue-500" style="width: 0%"></div>
                    </div>
                    <p id="cpu-cores" class="text-gray-500 text-xs">Physical Cores: -</p>
                </div>

                <div class="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <p class="text-gray-500 text-xs font-bold uppercase mb-4">Memory</p>
                    <h2 id="ram-percent" class="text-5xl font-black mb-2">0%</h2>
                    <div class="w-full bg-slate-950 h-1.5 rounded-full mb-4">
                        <div id="ram-bar" class="h-1.5 rounded-full bg-purple-500" style="width: 0%"></div>
                    </div>
                    <p id="ram-total" class="text-gray-500 text-xs">Total Capacity: -</p>
                </div>

                <div class="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl lg:col-span-2">
                    <p class="text-gray-500 text-xs font-bold uppercase mb-4">Storage (Disk Space)</p>
                    <div class="flex justify-between items-end mb-2">
                        <h2 id="disk-used" class="text-5xl font-black">0 GB</h2>
                        <span id="disk-percent" class="text-sm font-bold text-gray-400 mb-1">0% Used</span>
                    </div>
                    <div class="w-full bg-slate-950 h-1.5 rounded-full mb-4">
                        <div id="disk-bar" class="h-1.5 rounded-full bg-emerald-500" style="width: 0%"></div>
                    </div>
                    <div class="flex justify-between text-xs font-bold">
                        <span class="text-emerald-400">FREE: <span id="disk-free">-</span></span>
                        <span class="text-gray-500 uppercase">TOTAL: <span id="disk-total">-</span></span>
                    </div>
                </div>

                <div class="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="border-r border-slate-800 pr-4">
                        <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">OS Platform</p>
                        <p id="vps-os" class="font-bold text-sm text-blue-400">-</p>
                    </div>
                    <div class="border-r border-slate-800 pr-4">
                        <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Hostname</p>
                        <p id="vps-host" class="font-bold text-sm text-white">-</p>
                    </div>
                    <div class="border-r border-slate-800 pr-4">
                        <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Uptime</p>
                        <p id="vps-uptime" class="font-bold text-sm text-amber-400">-</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Load Avg</p>
                        <p id="vps-load" class="font-bold text-sm text-emerald-400">-</p>
                    </div>
                </div>
            </div>
        </div>

        <script>
            const socket = io('http://18.143.132.72:4000');
            
            socket.on('usageUpdate', (data) => {
                document.getElementById('cpu-percent').innerText = data.cpu + '%';
                document.getElementById('cpu-bar').style.width = data.cpu + '%';
                document.getElementById('cpu-cores').innerText = 'Physical Cores: ' + data.cores;

                document.getElementById('ram-percent').innerText = data.ram + '%';
                document.getElementById('ram-bar').style.width = data.ram + '%';
                document.getElementById('ram-total').innerText = 'Total Capacity: ' + data.totalRam;

                document.getElementById('disk-used').innerText = data.diskUsed;
                document.getElementById('disk-percent').innerText = data.diskPercent + '% Used';
                document.getElementById('disk-bar').style.width = data.diskPercent + '%';
                document.getElementById('disk-free').innerText = data.diskFree;
                document.getElementById('disk-total').innerText = data.diskTotal;

                document.getElementById('vps-os').innerText = data.platform;
                document.getElementById('vps-host').innerText = data.hostname;
                document.getElementById('vps-uptime').innerText = data.uptime;
                document.getElementById('vps-load').innerText = data.loadAvg;
            });
        </script>
    </body>
    </html>
    `);
});

http.listen(4000, () => console.log('Master Server live on port 4000'));
