# AI Service Dockerfile
# Multi-stage build for optimal size

FROM python:3.11-slim as builder

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Export requirements (without dev dependencies)
RUN poetry export -f requirements.txt --without-hashes -o requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by torch/PIL
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from builder
COPY --from=builder /app/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Environment variables
ENV PORT=8001
ENV PYTHONUNBUFFERED=1

EXPOSE 8001

# Run the application
CMD ["python", "-m", "uvicorn", "bg_remove_service.main:app", "--app-dir", "src", "--host", "0.0.0.0", "--port", "8001"]
