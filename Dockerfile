# ---- Stage 1: Build the React Frontend ----
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY project/package*.json ./
RUN npm install
COPY project/ ./
RUN npm run build

# ---- Stage 2: Standard Python Backend + Playwright + Combined Server ----
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by Playwright/Chromium headless
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatspi0 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers matching the python package
RUN playwright install --with-deps chromium

# Copy the rest of the backend code files from root
COPY . .

# Copy the compiled React build output from Stage 1 into /app/static
COPY --from=frontend-builder /app/dist /app/static

EXPOSE 8000

CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
