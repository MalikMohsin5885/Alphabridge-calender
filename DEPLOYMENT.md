# Deployment Guide for GCP

This guide will help you deploy the Alphabridge Calendar application to Google Cloud Platform (GCP).

## Prerequisites

1. **Google Cloud Account**: Create an account at [cloud.google.com](https://cloud.google.com)
2. **gcloud CLI**: Install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install from [docker.com](https://www.docker.com/products/docker-desktop)

## Setup GCP Project

1. **Login to Google Cloud**:
   ```bash
   gcloud auth login
   ```

2. **Create a new project** (or use existing):
   ```bash
   gcloud projects create alphabridge-calendar-prod --name="Alphabridge Calendar"
   ```

3. **Set the project**:
   ```bash
   gcloud config set project alphabridge-calendar-prod
   ```

4. **Enable required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

5. **Set up billing** (required for Cloud Run):
   - Go to [console.cloud.google.com/billing](https://console.cloud.google.com/billing)
   - Link a billing account to your project

## Deployment Options

### Option 1: Deploy with Cloud Run (Recommended)

This is the easiest and most cost-effective option for most applications.

1. **Configure gcloud for Cloud Run**:
   ```bash
   gcloud config set run/region us-central1
   ```

2. **Build and deploy directly**:
   ```bash
   gcloud run deploy alphabridge-calendar \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000
   ```

   This command will:
   - Build your Docker image using Cloud Build
   - Push it to Google Container Registry
   - Deploy to Cloud Run
   - Give you a public URL

3. **Set environment variables** (if needed):
   ```bash
   gcloud run services update alphabridge-calendar \
     --set-env-vars "NEXT_PUBLIC_API_URL=https://api.example.com" \
     --region us-central1
   ```

### Option 2: Manual Docker Build & Deploy

If you prefer more control over the build process:

1. **Build the Docker image locally**:
   ```bash
   docker build -t gcr.io/alphabridge-calendar-prod/alphabridge-calendar:latest .
   ```

2. **Test locally** (optional):
   ```bash
   docker run -p 3000:3000 gcr.io/alphabridge-calendar-prod/alphabridge-calendar:latest
   ```
   Visit http://localhost:3000 to verify

3. **Configure Docker to use gcloud**:
   ```bash
   gcloud auth configure-docker
   ```

4. **Push to Google Container Registry**:
   ```bash
   docker push gcr.io/alphabridge-calendar-prod/alphabridge-calendar:latest
   ```

5. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy alphabridge-calendar \
     --image gcr.io/alphabridge-calendar-prod/alphabridge-calendar:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000
   ```

### Option 3: CI/CD with Cloud Build

Set up automatic deployments from your Git repository:

1. **Connect your repository** to Cloud Build:
   - Go to [console.cloud.google.com/cloud-build/triggers](https://console.cloud.google.com/cloud-build/triggers)
   - Click "Connect Repository"
   - Follow the wizard to connect GitHub/GitLab/Bitbucket

2. **Create a trigger**:
   - Click "Create Trigger"
   - Set trigger to run on push to main branch
   - Use the included `cloudbuild.yaml` configuration

3. **Push to trigger deployment**:
   ```bash
   git push origin main
   ```

## Configuration

### Environment Variables

Set environment variables in Cloud Run:

```bash
gcloud run services update alphabridge-calendar \
  --set-env-vars "VAR_NAME=value,ANOTHER_VAR=value" \
  --region us-central1
```

Or use secrets for sensitive data:

```bash
# Create a secret
echo -n "sensitive-value" | gcloud secrets create my-secret --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding my-secret \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Use in Cloud Run
gcloud run services update alphabridge-calendar \
  --update-secrets="VAR_NAME=my-secret:latest" \
  --region us-central1
```

### Custom Domain

1. **Verify domain ownership** in GCP Console
2. **Map domain**:
   ```bash
   gcloud run domain-mappings create \
     --service alphabridge-calendar \
     --domain yourdomain.com \
     --region us-central1
   ```
3. **Update DNS** records as instructed

### Scaling Configuration

```bash
gcloud run services update alphabridge-calendar \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --cpu 1 \
  --memory 512Mi \
  --region us-central1
```

## Monitoring & Logs

1. **View logs**:
   ```bash
   gcloud run services logs read alphabridge-calendar --region us-central1
   ```

2. **Monitor in Console**:
   - Go to [console.cloud.google.com/run](https://console.cloud.google.com/run)
   - Click on your service
   - View metrics, logs, and revision history

## Cost Optimization

Cloud Run pricing is based on:
- CPU and memory allocation
- Request count
- Execution time

Tips:
- Set `--min-instances 0` to scale to zero when not in use
- Use `--cpu-throttling` for CPU throttling when not serving requests
- Monitor usage in [Billing Dashboard](https://console.cloud.google.com/billing)

## Troubleshooting

### Build fails
- Check `cloudbuild.yaml` syntax
- Verify all dependencies in `package.json`
- Check build logs in Cloud Build console

### Container doesn't start
- Verify Dockerfile syntax
- Check that port 3000 is exposed
- Review Cloud Run logs for startup errors

### 502/503 errors
- Increase memory allocation
- Check for startup timeout (default 300s)
- Review application logs for crashes

### Environment variables not working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Rebuild after changing server-side environment variables

## Rollback

To rollback to a previous version:

```bash
gcloud run services update-traffic alphabridge-calendar \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## Cleanup

To delete all resources:

```bash
# Delete Cloud Run service
gcloud run services delete alphabridge-calendar --region us-central1

# Delete container images
gcloud container images delete gcr.io/alphabridge-calendar-prod/alphabridge-calendar:latest

# Delete project (careful!)
gcloud projects delete alphabridge-calendar-prod
```

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)
