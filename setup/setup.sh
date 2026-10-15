#!/bin/bash

# Check if virtual environment exists
if [ ! -f "bin/activate" ]; then
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

echo "Starting application..."
python3 main.py