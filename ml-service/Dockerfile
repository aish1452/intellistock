FROM python:3.11-slim

WORKDIR /app

# Ensure we don't hold build artifacts
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service logic
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn server matching the host mapping
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
