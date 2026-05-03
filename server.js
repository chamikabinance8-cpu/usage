const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

let vpsStats = {}; 

app.post('/update', (req, res) => {
    const { id, cpu, ram } = req.body;
    vpsStats[id] = { cpu, ram, lastUpdated: Date.now() };
    io.emit('statsUpdate', vpsStats); 
    res.send('OK');
});

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live VPS Monitor</title><script src="https://cdn.tailwindcss.com"></script><script src="/socket.io/socket.io.js"></script>
    <style>body { background-color: #0f172a; color: white; font-family: 'Inter', sans-serif; }</style>
</head>
<body class="p-6">
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-400">Live VPS Monitor</h1>
    <div id="vps-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    <script>
        const socket = io();
        socket.on('statsUpdate', (data) => {
            const container = document.getElementById('vps-container');
            container.innerHTML = ''; 
            for (const [id, stats] of Object.entries(data)) {
                const cpuColor = stats.cpu >= 75 ? 'text-red-500' : 'text-green-400';
                const ramColor = stats.ram >= 75 ? 'text-red-500' : 'text-green-400';
                container.innerHTML += \`
                    <div class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 class="text-xl font-bold mb-4 text-white">\${id}</h2>
                        <div class="flex justify-between mb-3"><span class="text-gray-400">CPU Usage</span><span class="text-2xl font-bold \${cpuColor}">\${stats.cpu}%</span></div>
                        <div class="w-full bg-gray-700 rounded-full h-2.5 mb-5"><div class="h-2.5 rounded-full \${stats.cpu >= 75 ? 'bg-red-500' : 'bg-green-400'}" style="width: \${stats.cpu}%"></div></div>
                        <div class="flex justify-between mb-3"><span class="text-gray-400">RAM Usage</span><span class="text-2xl font-bold \${ramColor}">\${stats.ram}%</span></div>
                        <div class="w-full bg-gray-700 rounded-full h-2.5"><div class="h-2.5 rounded-full \${stats.ram >= 75 ? 'bg-red-500' : 'bg-green-400'}" style="width: \${stats.ram}%"></div></div>
                    </div>\`;
            }
        });
    </script>
</body>
</html>`;

app.get('/', (req, res) => res.send(htmlContent));
http.listen(3000, () => console.log('Dashboard running on port 3000'));
