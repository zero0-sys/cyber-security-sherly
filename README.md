# AI Sherly Lab - Advanced Cyber Security Operations Center

🔐 **Comprehensive Security Lab with Real-Time Threat Intelligence**

![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Node](https://img.shields.io/badge/node-18+-blue.svg)
![React](https://img.shields.io/badge/react-18.3-purple.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

## 🚀 Features

### Security Tools
- **Real Nmap Scanner** - Network reconnaissance and port scanning
- **Attack Simulator** - Simulate various cyber attacks (DDoS, Brute Force, SQL Injection)
- **RAT Simulation** - Remote Access Trojan demonstration
- **Cryptography Lab** - Hash generation (Argon2, bcrypt, PBKDF2, scrypt)

### Intelligence & Monitoring
- **Global Threat Map** - Real-time GeoIP attack visualization with Leaflet.js
- **Digital Soul AI** - Interactive AI assistant powered by Google Gemini
- **System Monitoring** - Live stats, heartbeat, and kernel logs
- **Network Intelligence** - IP tracking and geolocation

### Development Tools
- **Script Forge** - Multi-language code editor (11 languages supported)
  - Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, Ruby, PHP, Bash
- **Terminal CLI** - Full-featured bash terminal
- **File Vault** - Secure file storage and management
- **Database Viewer** - Browse and query databases

### Security Features
- **JWT Authentication** - Stateless auth with token-based sessions
- **2FA (TOTP)** - Two-factor authentication support
- **Rate Limiting** - API protection against abuse
- **RBAC** - Role-based access control (admin/user)

## 📦 Tech Stack

### Frontend
- **React 18.3** + **Vite 5.4** - Modern SPA framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Leaflet.js** - Interactive maps
- **Lucide React** - Beautiful icons
- **Monaco Editor** - VS Code-powered editor

### Backend
- **Node.js 18+** + **Express** - RESTful API server
- **WebSocket** - Real-time terminal communication
- **JWT** + **bcrypt** - Authentication & encryption
- **GeoIP-lite** - IP geolocation
- **Nmap** - Network scanning
- **Child Process** - Code execution sandbox

## 🛠️ Installation

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
nmap (for network scanning)
```

### Clone & Install
```bash
git clone https://github.com/yourusername/cyber-security-sherly.git
cd cyber-security-sherly
npm install
cd backend && npm install
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

Required environment variables:
- `VITE_GOOGLE_API_KEY` - Google Gemini API key
- `JWT_SECRET` - Secret key for JWT (min 32 chars)
- `PORT` - Backend port (default: 5001)

## 🚀 Development

### Start Backend
```bash
cd backend
node server.js
```
Backend runs on: `http://localhost:5001`

### Start Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:5000`

### Network Access
Frontend is accessible from other devices on your network:
```
http://YOUR_LOCAL_IP:5000
```

## 📤 Deployment

### Deploy Frontend to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL`, `VITE_GOOGLE_API_KEY`
5. Deploy!

### Deploy Backend to Render
1. Create new Web Service on Render.com
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node server.js`
5. Add environment variables (JWT_SECRET, GOOGLE_API_KEY, etc.)
6. Deploy!

See [deployment_plan.md](docs/deployment_plan.md) for detailed instructions.

## 🔑 Default Credentials

**Username:** `zero kyber`  
**Password:** `153762`

**⚠️ Change these in production!**

## 📁 Project Structure

```
cyber-security-sherly/
├── components/          # React components
│   ├── WorldMap.tsx    # Threat map visualization
│   ├── DigitalSoul.tsx # AI assistant
│   ├── CodeEditor.tsx  # Script forge
│   ├── Terminal.tsx    # CLI interface
│   └── ...
├── backend/
│   ├── server.js       # Express server
│   ├── routes/         # API routes
│   │   ├── auth.js     # Authentication
│   │   ├── geoip.js    # GeoIP threats
│   │   ├── execute.js  # Code execution
│   │   └── ...
│   └── middleware/     # Auth middleware
├── netlify.toml        # Netlify config
├── render.yaml         # Render config
└── vite.config.ts      # Vite config
```

## 🎯 Supported Languages (Script Forge)

- Python
- JavaScript / Node.js
- TypeScript
- C (with GCC)
- C++ (with G++)
- Java (with javac)
- Go
- Rust (with rustc)
- Ruby
- PHP
- Bash/Shell

## 🔒 Security Notes

- Never commit `.env` files
- Change default credentials immediately
- Use strong JWT_SECRET (32+ characters)
- Enable 2FA for production
- Configure CORS for production domains
- Use HTTPS in production

## 📜 License

MIT License - See [LICENSE](LICENSE) file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 👨‍💻 Author

**Zero Kyber** - Advanced Security Operations

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Leaflet.js for mapping
- Nmap for network scanning
- React & Vite communities

---

**⚡ Built with passion for cybersecurity education and demonstration purposes.**

**⚠️ Disclaimer:** This tool is for educational and ethical testing purposes only. Always obtain proper authorization before testing security systems.
