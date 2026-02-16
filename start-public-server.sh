#!/bin/bash

# AI Sherly Lab - Complete Local Server Setup with Public Access
# This script starts all services and creates a public tunnel

echo "🚀 Starting AI Sherly Lab - Local Server with Public Access"
echo "============================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Start RAG API Server (Python FastAPI)
echo -e "${BLUE}[1/4]${NC} Starting RAG API Server (LlamaIndex + Groq)..."
cd ai_sherly_llmindex_rag
python3 api_server.py > ../logs/rag-api.log 2>&1 &
RAG_PID=$!
echo -e "${GREEN}✓${NC} RAG API running on http://localhost:8000 (PID: $RAG_PID)"
cd ..

sleep 3

# 2. Start Backend (Node.js Express)
echo -e "${BLUE}[2/4]${NC} Starting Backend API Server..."
cd backend
node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend running on http://localhost:5001 (PID: $BACKEND_PID)"
cd ..

sleep 2

# 3. Start Frontend (Vite)
echo -e "${BLUE}[3/4]${NC} Starting Frontend Development Server..."
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend running on http://localhost:5000 (PID: $FRONTEND_PID)"

sleep 5

# 4. Create Public Tunnel (Cloudflared or Ngrok)
echo -e "${BLUE}[4/4]${NC} Creating Public Tunnel..."

if command -v cloudflared &> /dev/null; then
    echo -e "${GREEN}Using Cloudflared...${NC}"
    cloudflared tunnel --url http://localhost:5000 > logs/tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 3
    PUBLIC_URL=$(grep -oP 'https://.*\.trycloudflare\.com' logs/tunnel.log | head -1)
elif command -v ngrok &> /dev/null; then
    echo -e "${GREEN}Using Ngrok...${NC}"
    ngrok http 5000 > logs/tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 3
    PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+' | head -1 | cut -d '"' -f 4)
else
    echo -e "${YELLOW}⚠${NC} No tunnel tool found. Installing cloudflared..."
    # Install cloudflared on Debian/Ubuntu/Kali
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    
    cloudflared tunnel --url http://localhost:5000 > logs/tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 3
    PUBLIC_URL=$(grep -oP 'https://.*\.trycloudflare\.com' logs/tunnel.log | head -1)
fi

# Display Status
echo ""
echo "============================================================"
echo -e "${GREEN}✓ ALL SERVICES RUNNING!${NC}"
echo "============================================================"
echo ""
echo "📡 LOCAL ACCESS:"
echo "   Frontend:  http://localhost:5000"
echo "   Backend:   http://localhost:5001"
echo "   RAG API:   http://localhost:8000"
echo ""
echo "🌍 PUBLIC ACCESS (Internet):"
echo "   $PUBLIC_URL"
echo ""
echo "👤 DEFAULT LOGIN:"
echo "   Username: zero kyber"
echo "   Password: 153762"
echo ""
echo "============================================================"
echo "📊 SERVICE STATUS:"
echo "   RAG API:   PID $RAG_PID"
echo "   Backend:   PID $BACKEND_PID"
echo "   Frontend:  PID $FRONTEND_PID"
echo "   Tunnel:    PID $TUNNEL_PID"
echo ""
echo "📝 LOGS:"
echo "   tail -f logs/rag-api.log    # RAG API logs"
echo "   tail -f logs/backend.log    # Backend logs"
echo "   tail -f logs/frontend.log   # Frontend logs"
echo "   tail -f logs/tunnel.log     # Tunnel logs"
echo ""
echo "🛑 TO STOP ALL SERVICES:"
echo "   kill $RAG_PID $BACKEND_PID $FRONTEND_PID $TUNNEL_PID"
echo "   OR run: ./stop-servers.sh"
echo ""
echo "============================================================"

# Save PIDs to file for easy shutdown
echo "$RAG_PID" > logs/pids.txt
echo "$BACKEND_PID" >> logs/pids.txt
echo "$FRONTEND_PID" >> logs/pids.txt
echo "$TUNNEL_PID" >> logs/pids.txt

echo "✨ Share the public URL with anyone to access your lab!"
echo "Press Ctrl+C to view logs (services will continue running in background)"

# Keep script running and show logs
tail -f logs/tunnel.log
