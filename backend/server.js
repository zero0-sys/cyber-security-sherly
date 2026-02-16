import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import { spawn } from 'node-pty';
import { publicIpv4 } from 'public-ip';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireAdmin } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import cryptoRoutes from './routes/crypto.js';
import geoipRoutes from './routes/geoip.js';
import executeRoutes from './routes/execute.js';
import ragRoutes from './routes/rag.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for network access
    credentials: true
}));
app.use(express.json());

// Rate limiting
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per window
    message: 'Too many file uploads, please try again later.'
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.'
});

app.use('/api/', apiLimiter);

// Security headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'AI Sherly Backend API',
        version: '2.0.0',
        features: ['JWT Auth', '2FA', 'Rate Limiting', 'Real Nmap'],
        endpoints: {
            auth: '/api/auth/*',
            network: '/api/network/myip',
            files: '/api/files/*',
            scripts: '/api/scripts/*',
            execute: '/api/execute/code',
            git: '/api/git/*',
            nmap: '/api/nmap/scan'
        }
    });
});

// ==================== Auth Routes ====================
app.use('/api/auth', authRoutes);

// ==================== Crypto Routes ====================
app.use('/api/crypto', cryptoRoutes);

// ==================== GeoIP Threat Map ====================
app.use('/api/geoip', geoipRoutes);

// ==================== LlamaIndex RAG AI ====================
app.use('/api/rag', ragRoutes);

// Storage paths
const DATA_BREACH_DIR = path.join(__dirname, '../data-breach');
const SCRIPTS_DIR = path.join(__dirname, '../scripts');

// Ensure directories exist
await fs.mkdir(DATA_BREACH_DIR, { recursive: true });
await fs.mkdir(SCRIPTS_DIR, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const folder = req.body.folder || '';
        const targetDir = path.join(DATA_BREACH_DIR, folder);
        await fs.mkdir(targetDir, { recursive: true });
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// ==================== IP Detection API ====================
app.get('/api/network/myip', async (req, res) => {
    try {
        const ip = await publicIpv4();
        res.json({ ip, type: 'IPv4' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get IP address' });
    }
});

// ==================== File Operations API ====================

// List files and folders
app.get('/api/files/list', async (req, res) => {
    try {
        const folder = req.query.folder || '';
        const targetDir = path.join(DATA_BREACH_DIR, folder);

        const items = await fs.readdir(targetDir, { withFileTypes: true });
        const fileList = await Promise.all(
            items.map(async (item) => {
                const fullPath = path.join(targetDir, item.name);
                const stats = await fs.stat(fullPath);
                return {
                    name: item.name,
                    isDirectory: item.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime,
                    path: path.join(folder, item.name)
                };
            })
        );

        res.json({ files: fileList, currentPath: folder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload file
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
        res.json({
            success: true,
            file: {
                name: req.file.filename,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete file or folder
app.delete('/api/files/delete', async (req, res) => {
    try {
        const { path: filePath } = req.body;
        const targetPath = path.join(DATA_BREACH_DIR, filePath);

        // Security check: ensure path is within DATA_BREACH_DIR
        if (!targetPath.startsWith(DATA_BREACH_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const stats = await fs.stat(targetPath);
        if (stats.isDirectory()) {
            await fs.rm(targetPath, { recursive: true });
        } else {
            await fs.unlink(targetPath);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download file
app.get('/api/files/download', async (req, res) => {
    try {
        const filePath = req.query.path;
        const targetPath = path.join(DATA_BREACH_DIR, filePath);

        // Security check
        if (!targetPath.startsWith(DATA_BREACH_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.download(targetPath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create folder
app.post('/api/files/folder', async (req, res) => {
    try {
        const { path: folderPath } = req.body;
        const targetPath = path.join(DATA_BREACH_DIR, folderPath);

        if (!targetPath.startsWith(DATA_BREACH_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await fs.mkdir(targetPath, { recursive: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== Code Execution API ====================

// ==================== Code Execution ====================
app.use('/api/execute', executeRoutes);

// Health check endpoint for Railway
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'AI Sherly Backend',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// ==================== Scripts Management ====================// Save script file
app.post('/api/scripts/save', async (req, res) => {
    try {
        const { filename, content } = req.body;
        const filePath = path.join(SCRIPTS_DIR, filename);

        await fs.writeFile(filePath, content);
        res.json({ success: true, path: filePath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List scripts
app.get('/api/scripts/list', async (req, res) => {
    try {
        const items = await fs.readdir(SCRIPTS_DIR, { withFileTypes: true });
        const fileList = await Promise.all(
            items.map(async (item) => {
                const fullPath = path.join(SCRIPTS_DIR, item.name);
                const stats = await fs.stat(fullPath);
                return {
                    name: item.name,
                    size: stats.size,
                    modified: stats.mtime
                };
            })
        );

        res.json({ files: fileList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Load script content
app.get('/api/scripts/load', async (req, res) => {
    try {
        const { filename } = req.query;
        const filePath = path.join(SCRIPTS_DIR, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== Nmap Scanner API ====================

// Execute Nmap scan
app.post('/api/nmap/scan', async (req, res) => {
    try {
        const { target, scanType = 'basic', ports } = req.body;

        if (!target) {
            return res.status(400).json({ error: 'Target IP/hostname required' });
        }

        // Sanitize target input
        const sanitizedTarget = target.replace(/[;&|`$()]/g, '');

        // Build nmap command based on scan type
        let nmapCmd = 'nmap';

        switch (scanType) {
            case 'quick':
                nmapCmd += ` -T4 -F ${sanitizedTarget}`;
                break;
            case 'intense':
                nmapCmd += ` -T4 -A -v ${sanitizedTarget}`;
                break;
            case 'ping':
                nmapCmd += ` -sn ${sanitizedTarget}`;
                break;
            case 'stealth':
                nmapCmd += ` -sS ${sanitizedTarget}`;
                break;
            case 'version':
                nmapCmd += ` -sV ${sanitizedTarget}`;
                break;
            case 'os':
                nmapCmd += ` -O ${sanitizedTarget}`;
                break;
            case 'custom':
                if (ports) {
                    nmapCmd += ` -p ${ports} ${sanitizedTarget}`;
                } else {
                    nmapCmd += ` ${sanitizedTarget}`;
                }
                break;
            default: // basic
                nmapCmd += ` ${sanitizedTarget}`;
        }

        console.log(`Executing: ${nmapCmd}`);

        const { stdout, stderr } = await execAsync(nmapCmd, {
            timeout: 120000, // 2 minute timeout
            maxBuffer: 1024 * 1024 * 5 // 5MB buffer
        });

        res.json({
            success: true,
            output: stdout,
            error: stderr,
            command: nmapCmd,
            target: sanitizedTarget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            output: error.stdout || '',
            errorOutput: error.stderr || ''
        });
    }
});

// ==================== Git Operations API ====================

// Git clone
app.post('/api/git/clone', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'Repository URL required' });
        }

        // Extract repo name from URL
        const repoName = url.split('/').pop().replace('.git', '');
        const targetPath = path.join(SCRIPTS_DIR, repoName);

        const { stdout, stderr } = await execAsync(`git clone "${url}" "${targetPath}"`, {
            timeout: 60000 // 60 second timeout
        });

        res.json({
            success: true,
            output: stdout + stderr,
            path: targetPath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            output: error.stdout || error.stderr || ''
        });
    }
});

// Git pull
app.post('/api/git/pull', async (req, res) => {
    try {
        const { stdout, stderr } = await execAsync('git pull', {
            timeout: 30000,
            cwd: SCRIPTS_DIR
        });

        res.json({
            success: true,
            output: stdout + stderr
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            output: error.stdout || error.stderr || ''
        });
    }
});

// Git commit
app.post('/api/git/commit', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Commit message required' });
        }

        // Stage all changes
        await execAsync('git add .', { cwd: SCRIPTS_DIR });

        // Commit
        const { stdout, stderr } = await execAsync(`git commit -m "${message}"`, {
            timeout: 10000,
            cwd: SCRIPTS_DIR
        });

        res.json({
            success: true,
            output: stdout + stderr
        });
    } catch (error) {
        // Git commit returns exit code 1 if nothing to commit
        if (error.message.includes('nothing to commit')) {
            res.json({
                success: true,
                output: 'Nothing to commit, working tree clean'
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message,
                output: error.stdout || error.stderr || ''
            });
        }
    }
});

// Git push
app.post('/api/git/push', async (req, res) => {
    try {
        const { stdout, stderr } = await execAsync('git push', {
            timeout: 60000,
            cwd: SCRIPTS_DIR
        });

        res.json({
            success: true,
            output: stdout + stderr
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            output: error.stdout || error.stderr || ''
        });
    }
});

// Start Express server
const server = app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📁 Data Breach Directory: ${DATA_BREACH_DIR}`);
    console.log(`📝 Scripts Directory: ${SCRIPTS_DIR}`);
});

// ==================== WebSocket Terminal ====================

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('📡 Terminal WebSocket connected');

    // Spawn a shell process
    const shell = spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    // Forward shell output to WebSocket
    shell.onData((data) => {
        ws.send(JSON.stringify({ type: 'output', data }));
    });

    // Handle shell exit
    shell.onExit(({ exitCode, signal }) => {
        ws.send(JSON.stringify({ type: 'exit', exitCode, signal }));
        ws.close();
    });

    // Handle WebSocket messages (input from client)
    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        if (msg.type === 'input') {
            shell.write(msg.data);
        } else if (msg.type === 'resize') {
            shell.resize(msg.cols, msg.rows);
        }
    });

    // Handle WebSocket close
    ws.on('close', () => {
        console.log('📡 Terminal WebSocket disconnected');
        shell.kill();
    });
});

console.log('🔌 WebSocket terminal server ready');
