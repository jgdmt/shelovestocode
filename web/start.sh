#!/bin/bash
python3 -m http.server 8001 --directory .
open -a 'Google Chrome' http://localhost:8001/index.html