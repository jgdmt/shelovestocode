#!/bin/bash

# Check if virtual environment exists
if [ ! -d "bin" ]; then
    echo "Setting up virtual environment..."
    python3 -m venv .
    source bin/activate
    python3 -m pip install uvicorn
    python3 -m pip install fastapi
else
    echo "Activating existing virtual environment..."
    source bin/activate
fi

echo "Starting application..."
python3 main.py