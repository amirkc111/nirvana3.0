FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-hin \
    libtesseract-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy API code and astronomical data
COPY . .

# Ensure the app runs on 0.0.0.0 so it can be reached outside the container
# The script usually defaults to 127.0.0.1 or we might need to modify it
ENV FLASK_APP=working_panchang_api.py

EXPOSE 5002

# Run the API server directly, ensuring it listens on all interfaces
CMD ["python", "working_panchang_api.py"]
