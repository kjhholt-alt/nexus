#!/bin/bash
# Start Nexus dev server + orchestrator together
# Usage: bash scripts/start-all.sh

NEXUS_DIR="C:/Users/Kruz/Desktop/Projects/nexus"
cd "$NEXUS_DIR"

mkdir -p logs

echo "Starting Nexus dev server on port 3000..."
npm run dev &
DEV_PID=$!

echo "Waiting for dev server..."
sleep 5

echo "Starting Swarm Orchestrator..."
python -m swarm.orchestrator > logs/orchestrator.log 2>&1 &
ORCH_PID=$!

echo ""
echo "=== NEXUS RUNNING ==="
echo "  Dev server:    http://localhost:3000  (PID: $DEV_PID)"
echo "  Orchestrator:  python -m swarm.orchestrator  (PID: $ORCH_PID)"
echo "  Logs:          logs/orchestrator.log"
echo ""
echo "Press Ctrl+C to stop all"

# Wait for either to exit
wait $DEV_PID $ORCH_PID
