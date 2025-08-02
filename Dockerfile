# Use the official Deno image as a base
FROM denoland/deno:latest

# Set the working directory inside the container
WORKDIR /app

# Expose the port for the web server
EXPOSE 8000

# Copy only the dependency manifests first to leverage Docker layer caching
COPY backend/deno.json backend/deno.lock ./

# Cache dependencies for both the web server and the worker.
# This runs only when deno.json or deno.lock changes.
RUN deno cache --lock=deno.lock --lock-write src/routes/reports.ts src/workers/report_processor.ts

# Copy the backend source code and the startup script
COPY backend/ ./
COPY start.sh .

# Make the startup script executable
RUN chmod +x ./start.sh

# The CMD is now the startup script, which will handle secrets
CMD ["./start.sh"]