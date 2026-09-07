# ---- Stage 1: Build the React Frontend ----
FROM node:18-alpine AS frontend-builder
WORKDIR /app/project
COPY project/package*.json ./
RUN npm install
COPY project/ ./
RUN npm run build

# ---- Stage 2: Official Playwright Python Image ----
FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

WORKDIR /app

# Copy and install Python backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ensure Playwright browser binaries are active
RUN playwright install chromium

# Copy the rest of the root backend code files
COPY . .

# Copy the compiled React frontend build output from project/dist into /app/static
COPY --from=frontend-builder /app/project/dist /app/static

EXPOSE 8000

CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
