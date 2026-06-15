#!/usr/bin/env bash
set -euo pipefail
JS=$(curl -s https://www.skypostnews.com/ | grep -oE '/assets/index[^"]+\.js' | head -1)
echo "JS bundle: $JS"
echo "--- API URLs found in bundle ---"
curl -s "https://www.skypostnews.com$JS" | grep -oE 'https://[a-zA-Z0-9._-]+\.(com|app)' | sort -u
