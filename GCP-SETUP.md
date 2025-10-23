# 🚀 GCP Deployment Setup - Complete

Your Alphabridge Calendar project is now ready for Google Cloud Platform deployment!

## ✅ What's Been Added

### Docker Configuration
- **Dockerfile** - Multi-stage build optimized for production
- **.dockerignore** - Excludes unnecessary files from Docker builds
- **docker-compose.yml** - For local testing with Docker

### GCP Deployment Files
- **deploy-gcp.sh** - One-click deployment script
- **cloudbuild.yaml** - CI/CD configuration for Cloud Build
- **DEPLOYMENT.md** - Comprehensive deployment guide
- **DOCKER.md** - Docker reference and troubleshooting

### Configuration Updates
- **next.config.mjs** - Added `output: 'standalone'` for Docker optimization
- **.env.example** - Template for environment variables

## 🎯 Quick Start

### Option 1: Automated Deployment (Recommended)
```bash
# Make sure you have gcloud CLI installed and authenticated
./deploy-gcp.sh
```

### Option 2: Test Locally First
```bash
# Build and run with Docker Compose
docker-compose up --build

# Visit http://localhost:3000 to test
```

Then deploy to GCP:
```bash
./deploy-gcp.sh
```

### Option 3: Manual Deployment
```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set your project
gcloud config set project YOUR_PROJECT_ID

# 3. Deploy
gcloud run deploy alphabridge-calendar \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ Google Cloud account ([cloud.google.com](https://cloud.google.com))
2. ✅ gcloud CLI installed ([installation guide](https://cloud.google.com/sdk/docs/install))
3. ✅ Billing enabled on your GCP project
4. ✅ Docker installed (for local testing)

## 🔧 Configuration

### Environment Variables
If your app needs environment variables:

1. Create `.env.local` for local development
2. For production, set them in Cloud Run:
```bash
gcloud run services update alphabridge-calendar \
  --set-env-vars "VAR_NAME=value" \
  --region us-central1
```

### Custom Domain
After deployment, you can map a custom domain:
```bash
gcloud run domain-mappings create \
  --service alphabridge-calendar \
  --domain yourdomain.com \
  --region us-central1
```

## 📊 Expected Costs

Cloud Run pricing (approximate):
- **Free tier**: 2 million requests/month, 360,000 GB-seconds/month
- **After free tier**: ~$0.40 per million requests
- **Idle scaling**: Scales to zero when not in use (no cost)

Your configuration (512Mi RAM, 1 CPU) is cost-optimized for most use cases.

## 📚 Documentation

- **DEPLOYMENT.md** - Complete deployment guide with all options
- **DOCKER.md** - Docker commands and troubleshooting
- **README.md** - Original Next.js documentation

## 🆘 Need Help?

### Common Issues

**Build fails:**
```bash
# Check build logs
gcloud builds log --region=us-central1
```

**Can't access deployed app:**
```bash
# Check if service is running
gcloud run services list --region=us-central1

# View logs
gcloud run services logs read alphabridge-calendar --region=us-central1
```

**Want to rollback:**
```bash
# List revisions
gcloud run revisions list --service=alphabridge-calendar --region=us-central1

# Route traffic to previous revision
gcloud run services update-traffic alphabridge-calendar \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

## 🎉 Next Steps

1. **Deploy**: Run `./deploy-gcp.sh`
2. **Test**: Visit the provided URL
3. **Monitor**: Check Cloud Run console for metrics
4. **Optimize**: Adjust resources based on usage
5. **Secure**: Set up authentication if needed
6. **Scale**: Cloud Run auto-scales based on traffic

## 📞 Support Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment)
- [GCP Support](https://cloud.google.com/support)

---

**Ready to deploy?** Just run: `./deploy-gcp.sh` 🚀
