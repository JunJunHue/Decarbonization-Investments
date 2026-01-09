#!/bin/bash

# Setup script for Data Center Demand Predictor

echo "Setting up Data Center Demand Predictor..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
mkdir -p data
mkdir -p ml_model/models
mkdir -p logs

echo "Setup complete!"
echo ""
echo "To activate the virtual environment, run:"
echo "  source venv/bin/activate"
echo ""
echo "To run the pipeline, execute:"
echo "  python run_pipeline.py"
