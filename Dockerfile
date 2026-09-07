# ---- Stage 1: Build the React Frontend ----
FROM node:18-alpine AS frontend-builder
WORKDIR /app/project
COPY project/package*.json ./
RUN npm install
COPY project/ ./
RUN npm run build

# ---- Stage 2: Python Backend + Playwright + Combined Server ----
FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

WORKDIR /app

# Copy and install Python backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ensure Playwright browser binaries and all required OS packages are fully mapped
RUN playwright install chromium

# Copy the rest of the root backend code files
COPY . .

# Copy the compiled React build files from Stage 1 into the /app/static folder
COPY --from=frontend-builder /app/project/dist /app/static

# Render injects the runtime port via the $PORT environment variable
EXPOSE 8000

# Start FastAPI/Uvicorn binding to the dynamic port
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}