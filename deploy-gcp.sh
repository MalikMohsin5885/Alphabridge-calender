#!/bin/bash

# Quick deployment script for GCP Cloud Run
# Make this file executable: chmod +x deploy-gcp.sh

set -e

echo "🚀 Alphabridge Calendar - GCP Deployment Script"
echo "================================================"

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-alphabridge-calendar-prod}"
SERVICE_NAME="alphabridge-calendar"
REGION="${GCP_REGION:-us-central1}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Service: $SERVICE_NAME"
echo "  Region: $REGION"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}Not logged in to gcloud. Logging in...${NC}"
    gcloud auth login
fi

# Set project
echo -e "\n${YELLOW}Setting project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "\n${YELLOW}Enabling required APIs (this may take a moment)...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com --quiet

# Deploy
echo -e "\n${GREEN}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your application is live at: $SERVICE_URL${NC}"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo "  View logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
echo "  Update service: gcloud run services update $SERVICE_NAME --region $REGION"
echo "  Delete service: gcloud run services delete $SERVICE_NAME --region $REGION"
