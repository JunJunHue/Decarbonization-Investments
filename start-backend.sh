#!/bin/bash
# Script to start the backend API server

cd "$(dirname "$0")/data-center-predictor"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start the API server
python api/app.py
