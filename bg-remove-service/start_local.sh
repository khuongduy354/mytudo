#!/bin/bash

# Navigate to the service directory
cd "$(dirname "$0")"

echo "🚀 Starting AI Service locally..."

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment not found in .venv"
    echo "📦 Creating virtual environment and installing dependencies..."
    poetry config virtualenvs.in-project true
    poetry install
fi

# Activate virtual environment
source .venv/bin/activate

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
        echo "❗ PLEASE UPDATE .env with your OPENROUTER_API_KEY before continuing!"
        exit 1
    else
        echo "❌ .env.example also not found. Please create a .env file."
        exit 1
    fi
fi

# Add src to PYTHONPATH just in case, though app-dir handles most of it
export PYTHONPATH=$PYTHONPATH:$(pwd)/src

echo "✅ Environment activated."
echo "🔌 Starting Uvicorn server on port 8001..."

# Run the server
# --reload enables hot-reloading for development
python -m uvicorn bg_remove_service.main:app --app-dir src --host 0.0.0.0 --port 8001 --reload
