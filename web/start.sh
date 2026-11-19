#!/bin/bash
# Starts the workshop server (without browser cache) and opens the home page.
cd "$(dirname "$0")"
python3 serve.py 8001 &
sleep 1
if [ "$(uname)" == "Linux" ]; then
    echo "Launching Google Chrome"
    google-chrome http://localhost:8001
    if [ $? != 0 ]; then
        rm -rf ~/.config/google-chrome/Singleton*
        google-chrome http://localhost:8001
        if [ $? != 0 ]; then    
            echo "Launching Google Chrome failed, launching Firefox instead"
            firefox http://localhost:8001
        fi
    fi
elif [ "$(uname)" == "Darwin" ]; then
    echo "Launching Google Chrome"
    open -a 'Google Chrome' http://localhost:8001/index.html
    if [ $? != 0 ]; then
        echo "Launching Google Chrome failed, launching Firefox instead"
        open -a 'Firefox' http://localhost:8001
    fi
fi

wait
