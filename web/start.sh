#!/bin/bash
# Starts the workshop server (without browser cache) and opens the home page.
cd "$(dirname "$0")"
python3 serve.py 8001 &
sleep 1
open -a 'Google Chrome' http://localhost:8001/index.html
wait
