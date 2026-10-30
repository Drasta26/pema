#!/bin/bash
# Double-click to run PeMA locally on this Mac. Then view http://localhost:3000 in the Claude app browser pane
cd "$(dirname "$0")"
TOOLS="$(cd ../../tools 2>/dev/null && pwd)"
if ! command -v node >/dev/null 2>&1 && [ -x "$TOOLS/node/bin/node" ]; then export PATH="$TOOLS/node/bin:$PATH"; fi
command -v node >/dev/null 2>&1 || { echo "Node.js not found. Install it from nodejs.org, then run this again."; read -n1; exit 1; }
[ -f .env.local ] || { cp .env.example .env.local; echo "Created .env.local - add your ANTHROPIC_API_KEY there for live Claude sessions."; }
[ -d node_modules ] || npm install --no-audit --no-fund
npm run dev
