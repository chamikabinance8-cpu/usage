const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const os = require('os');
const psutil = require('os-utils');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login Page එක
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VPS Dashboard Login</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-white font-sans flex items-center justify-center h-screen">
        <div class="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-96">
            <h2 class="text-3xl font-extrabold text-center text-blue-400 mb-2">Welcome</h2>
            <p class="text-center text-gray-500 text-sm mb-8">Sign in to monitor your server</p>
            
            <form action="/login" method="POST" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Username</label>
                    <input type="text" name="username" required class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <input type="password" name="password" required class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition">
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-600/30">LOGIN</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

// Login Check කිරීම
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123') {
        res.send(dashboardPage());
    } else {
        res.send(`
        <script>alert('Invalid Credentials!'); window.location.href='/';</script>
        `);
    }
});

function dashboardPage() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Local VPS Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/socket.io/socket.io.js"></script>
        <style>
            body { background-color: #050b14; color: white; font-family: 'Inter', sans-serif; }
        </style>
    </head>
    <body class="p-8">
        <div class="max-w-5xl mx-auto">
            <div class="flex justify-between items-center mb-10">
                <div>
                    <h1 class="text-4xl font-black text-blue-500 tracking-tight">System Monitor</h1>
                    <p class="text-gray-400 text-sm mt-1">Advanced real-time resource tracking</p>
                </div>
                <a href="/" class="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition text-sm">Log Out</a>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-lg font-bold text-gray-300">CPU Usage</span>
                        <span id="cpu-badge" class="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Normal</span>
                    </div>
                    <div class="flex justify-between items-baseline mb-4">
                        <span id="cpu-percent" class="text-4xl font-extrabold tracking-tight">0%</span>
                        <span id="cpu-cores" class="text-gray-500 text-xs">Cores: -</span>
                    </div>
                    <div class="w-full bg-slate-950 rounded-full h-2">
                        <div id="cpu-bar" class="h-2 rounded-full bg-green-400 transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>

                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-lg font-bold text-gray-300">RAM Usage</span>
                        <span id="ram-badge" class="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Normal</span>
                    </div>
                    <div class="flex justify-between items-baseline mb-4">
                        <span id="ram-percent" class="text-4xl font-extrabold tracking-tight">0%</span>
                        <span id="ram-total" class="text-gray-500 text-xs">Total: -</span>
                    </div>
                    <div class="w-full bg-slate-950 rounded-full h-2">
                        <div id="ram-bar" class="h-2 rounded-full bg-green-400 transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>

                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-2xl">
                    <h3 class="text-lg font-bold text-gray-300 mb-4">System Identity</h3>
                    <div class="space-y-3 text-sm text-gray-400">
                        <div class="flex justify-between">
                            <span>Host:</span>
                            <span id="vps-host" class="text-blue-400 font-mono">-</span>
                        </div>
                        <div class="flex justify-between">
                            <span>OS:</span>
                            <span id="vps-os" class="text-gray-200">-</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Arch:</span>
                            <span id="vps-arch" class="text-gray-200">-</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-2xl md:col-span-3">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500 mb-1">Server Uptime</h4>
                            <p id="vps-uptime" class="text-2xl font-bold text-emerald-400 font-mono">-</p>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500 mb-1">Load Average</h4>
                            <p id="vps-load" class="text-2xl font-bold text-amber-400 font-mono">-</p>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500 mb-1">Free Memory</h4>
                            <p id="vps-freeram" class="text-2xl font-bold text-cyan-400 font-mono">-</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <script>
            const socket = io();

            socket.on('usageUpdate', (data) => {
                // CPU Data
                document.getElementById('cpu-percent').innerText = data.cpu + '%';
                document.getElementById('cpu-cores').innerText = 'Cores: ' + data.cores;
                const cpuBar = document.getElementById('cpu-bar');
                const cpuBadge = document.getElementById('cpu-badge');
                if (data.cpu >= 75) {
                    cpuBar.className = 'h-2 rounded-full bg-red-500 transition-all duration-300';
                    cpuBadge.className = 'px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-500';
                    cpuBadge.innerText = 'High';
                } else {
                    cpuBar.className = 'h-2 rounded-full bg-green-400 transition-all duration-300';
                    cpuBadge.className = 'px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400';
                    cpuBadge.innerText = 'Normal';
                }
                cpuBar.style.width = data.cpu + '%';

                // RAM Data
                document.getElementById('ram-percent').innerText = data.ram + '%';
                document.getElementById('ram-total').innerText = 'Total: ' + data.totalRam;
                const ramBar = document.getElementById('ram-bar');
                const ramBadge = document.getElementById('ram-badge');
                if (data.ram >= 75) {
                    ramBar.className = 'h-2 rounded-full bg-red-500 transition-all duration-300';
                    ramBadge.className = 'px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-500';
                    ramBadge.innerText = 'High';
                } else {
                    ramBar.className = 'h-2 rounded-full bg-green-400 transition-all duration-300';
                    ramBadge.className = 'px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400';
                    ramBadge.innerText = 'Normal';
                }
                ramBar.style.width = data.ram + '%';
                
                // අමතර තොරතුරු (A to Z)
                document.getElementById('vps-freeram').innerText = data.freeRam;
                document.getElementById('vps-host').innerText = data.hostname;
                document.getElementById('vps-os').innerText = data.platform + ' ' + data.osRelease;
                document.getElementById('vps-arch').innerText = data.arch;
                document.getElementById('vps-load').innerText = data.loadAvg;
                document.getElementById('vps-uptime').innerText = data.uptime;
            });
        </script>
    </body>
    </html>
    `;
}

// දත්ත එකතු කිරීම
const ioObj = require('socket.io')(http);

function formatUptime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

setInterval(() => {
    psutil.cpuUsage((v) => {
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + ' GB';
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1) + ' GB';
        const usedMem = (os.totalmem() - os.freemem());
        const usedPercent = ((usedMem / os.totalmem()) * 100).toFixed(0);

        const data = {
            cpu: (v * 100).toFixed(0),
            cores: os.cpus().length,
            ram: usedPercent,
            totalRam: totalMem,
            freeRam: freeMem,
            hostname: os.hostname(),
            platform: os.platform(),
            osRelease: os.release(),
            arch: os.arch(),
            loadAvg: os.loadavg()[0].toFixed(2),
            uptime: formatUptime(os.uptime())
        };
        ioObj.emit('usageUpdate', data);
    });
}, 2000);

http.listen(3000, () => console.log('All-in-one monitor active on port 3000'));
