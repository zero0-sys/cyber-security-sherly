#!/bin/bash

# Stop all AI Sherly Lab services

echo "🛑 Stopping all AI Sherly Lab services..."

if [ -f logs/pids.txt ]; then
    while read pid; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo "✓ Stopped process $pid"
        fi
    done < logs/pids.txt
    rm logs/pids.txt
    echo "✓ All services stopped"
else
    echo "⚠ No PID file found. Killing by name..."
    pkill -f "api_server.py"
    pkill -f "node server.js"
    pkill -f "vite"
    pkill -f "cloudflared"
    pkill -f "ngrok"
    echo "✓ Cleanup complete"
fi
