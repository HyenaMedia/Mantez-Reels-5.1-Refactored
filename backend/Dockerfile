FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (ca-certificates needed for MongoDB Atlas TLS)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Railway assigns a dynamic PORT — default to 8001 for local Docker usage
ENV PORT=8001
EXPOSE ${PORT}

# Run the application using the PORT env var
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT}
