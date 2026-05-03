const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const crypto = require('crypto');

app.use(express.json());

let allUserData = {}; 

// අලුත් Token එකක් සෑදීම
app.get('/register', (req, res) => {
    const newToken = crypto.randomBytes(4).toString('hex').toUpperCase(); // උදා: A1B2C3D4
    res.json({ token: newToken });
});

app.post('/update', (req, res) => {
    const { token, id, cpu, ram } = req.body;
    if (!token) return res.status(400).send("Token required");

    if (!allUserData[token]) allUserData[token] = {};
    allUserData[token][id] = { cpu, ram, lastUpdated: Date.now() };
    
    io.emit(`update_${token}`, allUserData[token]); 
    res.send('OK');
});

// UI එක (කලින් ලබා දුන් ආකාරයටම වේ, නමුත් UI එකේ Token එක පෙන්වන තැනක් ඇත)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart VPS Monitor</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body class="bg-slate-900 text-white p-6">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-center text-blue-400 mb-2">Live VPS Monitor</h1>
            <p class="text-center text-gray-500 mb-8 font-mono text-sm">Real-time server resource tracking</p>
            
            <div id="login-box" class="bg-gray-800 p-6 rounded-2xl shadow-xl mb-8 border border-gray-700">
                <label class="block mb-2 text-sm text-gray-400">Enter your personal token to view stats:</label>
                <div class="flex gap-2">
                    <input type="text" id="user-token" placeholder="XXXX-XXXX" class="bg-gray-900 border border-gray-600 rounded-lg p-3 flex-1 focus:outline-none focus:border-blue-500 font-mono">
                    <button onclick="startMonitoring()" class="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold transition">LOGIN</button>
                </div>
            </div>

            <div id="vps-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
        </div>

        <script>
            const socket = io();
            function startMonitoring() {
                const token = document.getElementById('user-token').value.toUpperCase();
                if(!token) return alert("Please enter your token!");

                document.getElementById('vps-container').innerHTML = '<p class="text-center col-span-2 text-blue-400 animate-pulse">Syncing with servers...</p>';
                
                socket.on('update_' + token, (vpsList) => {
                    const container = document.getElementById('vps-container');
                    container.innerHTML = '';
                    for (const [id, stats] of Object.entries(vpsList)) {
                        const cpuColor = stats.cpu >= 75 ? 'bg-red-500' : 'bg-green-500';
                        const ramColor = stats.ram >= 75 ? 'bg-red-500' : 'bg-green-500';
                        container.innerHTML += \`
                            <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-blue-500/50 transition duration-300">
                                <div class="flex justify-between items-center mb-6">
                                    <h2 class="text-xl font-bold text-white truncate">\${id}</h2>
                                    <span class="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                                </div>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between text-sm mb-1 text-gray-400"><span>CPU Usage</span><span>\${stats.cpu}%</span></div>
                                        <div class="w-full bg-gray-900 rounded-full h-2"><div class="\${cpuColor} h-2 rounded-full transition-all duration-500" style="width:\${stats.cpu}%"></div></div>
                                    </div>
                                    <div>
                                        <div class="flex justify-between text-sm mb-1 text-gray-400"><span>RAM Usage</span><span>\${stats.ram}%</span></div>
                                        <div class="w-full bg-gray-900 rounded-full h-2"><div class="\${ramColor} h-2 rounded-full transition-all duration-500" style="width:\${stats.ram}%"></div></div>
                                    </div>
                                </div>
                            </div>\`;
                    }
                });
            }
        </script>
    </body>
    </html>
    `);
});

http.listen(3000, () => console.log('Dashboard active on port 3000'));
