# Python background removal service
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml README.md ./
COPY src ./src

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir .

EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "bg_remove_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
