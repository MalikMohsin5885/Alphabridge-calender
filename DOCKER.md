# Docker Quick Reference

## Local Testing with Docker

### Build the Docker image
```bash
docker build -t alphabridge-calendar .
```

### Run the container locally
```bash
docker run -p 3000:3000 alphabridge-calendar
```

Then visit http://localhost:3000

### Using Docker Compose (Recommended for local testing)
```bash
# Build and start
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### With environment variables
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  alphabridge-calendar
```

Or create a `.env.local` file and use:
```bash
docker run -p 3000:3000 --env-file .env.local alphabridge-calendar
```

## GCP Deployment Commands

### Quick Deploy (Easiest)
```bash
./deploy-gcp.sh
```

Or manually:
```bash
gcloud run deploy alphabridge-calendar \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### Build and Push to Google Container Registry
```bash
# Set your project ID
PROJECT_ID="your-project-id"

# Build
docker build -t gcr.io/$PROJECT_ID/alphabridge-calendar:latest .

# Configure Docker for GCP
gcloud auth configure-docker

# Push
docker push gcr.io/$PROJECT_ID/alphabridge-calendar:latest

# Deploy
gcloud run deploy alphabridge-calendar \
  --image gcr.io/$PROJECT_ID/alphabridge-calendar:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Troubleshooting

### Build fails with "out of memory"
Increase Docker memory limit in Docker Desktop settings (minimum 4GB recommended)

### Cannot connect to localhost:3000
- Check if container is running: `docker ps`
- Check logs: `docker logs <container-id>`
- Ensure port 3000 is not already in use: `lsof -i :3000`

### Changes not reflecting
- Rebuild without cache: `docker build --no-cache -t alphabridge-calendar .`
- Remove old images: `docker system prune -a`

### Permission errors in container
The Dockerfile uses a non-root user (nextjs:nodejs) for security. If you encounter permission issues, check file ownership.

## Production Best Practices

1. **Use multi-stage builds** ✅ (Already implemented in Dockerfile)
2. **Enable standalone output** ✅ (Configured in next.config.mjs)
3. **Use .dockerignore** ✅ (Prevents copying unnecessary files)
4. **Run as non-root user** ✅ (Security best practice)
5. **Set resource limits** in Cloud Run (see DEPLOYMENT.md)
6. **Use secrets for sensitive data** (see DEPLOYMENT.md)
7. **Enable health checks** ✅ (Included in docker-compose.yml)

## Image Size Optimization

The multi-stage Dockerfile is optimized for size:
- Uses Alpine Linux (minimal base image)
- Only copies production dependencies
- Removes build artifacts
- Expected final image size: ~150-250MB

To check image size:
```bash
docker images alphabridge-calendar
```
