#!/bin/bash

if [ ! -d "bin" ]; then
    echo "Setting up virtual environment..."
    python3 -m venv .
    source bin/activate
    python3 -m pip install uvicorn
    python3 -m pip install fastapi
    python3 -m pip install requests
else
    echo "Activating existing virtual environment..."
    source bin/activate
fi

if [ $# -lt 2 ] ; then
    echo "Missing arguments. Use script like this:"
    echo "sh reset.sh [branch: str (python, c, shell, web)] [module: int]"
    exit 1
fi
    
python3 reset.py $1 $2
