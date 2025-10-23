#!/bin/bash

# Pre-deployment verification script
# This script checks if your project is ready for GCP deployment

set -e

echo "🔍 Alphabridge Calendar - Pre-Deployment Checks"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo "Checking project files..."
echo ""

# Check required files
if [ -f "Dockerfile" ]; then
    check_pass "Dockerfile exists"
else
    check_fail "Dockerfile not found"
fi

if [ -f ".dockerignore" ]; then
    check_pass ".dockerignore exists"
else
    check_warn ".dockerignore not found (recommended)"
fi

if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json not found"
fi

if [ -f "next.config.mjs" ]; then
    check_pass "next.config.mjs exists"
    
    # Check for standalone output
    if grep -q "output.*standalone" next.config.mjs; then
        check_pass "Standalone output is enabled"
    else
        check_fail "Standalone output not enabled in next.config.mjs"
    fi
else
    check_fail "next.config.mjs not found"
fi

echo ""
echo "Checking dependencies..."
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js is installed ($NODE_VERSION)"
else
    check_warn "Node.js not found (needed for local testing)"
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm is installed ($NPM_VERSION)"
else
    check_warn "npm not found (needed for local testing)"
fi

# Check if Docker is installed
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    check_pass "Docker is installed ($DOCKER_VERSION)"
else
    check_warn "Docker not found (needed for local testing)"
fi

# Check if gcloud is installed
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud version --format="value(core)" 2>/dev/null)
    check_pass "gcloud CLI is installed ($GCLOUD_VERSION)"
    
    # Check if authenticated
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n 1)
        check_pass "Authenticated with gcloud ($ACCOUNT)"
    else
        check_warn "Not authenticated with gcloud (run: gcloud auth login)"
    fi
else
    check_warn "gcloud CLI not found (needed for GCP deployment)"
fi

echo ""
echo "Checking project structure..."
echo ""

# Check critical directories
if [ -d "src" ]; then
    check_pass "src/ directory exists"
else
    check_fail "src/ directory not found"
fi

if [ -d "public" ]; then
    check_pass "public/ directory exists"
else
    check_warn "public/ directory not found"
fi

if [ -d "node_modules" ]; then
    check_pass "node_modules/ exists (dependencies installed)"
else
    check_warn "node_modules/ not found (run: npm install)"
fi

echo ""
echo "================================================"
echo "Summary:"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo "You can proceed, but consider addressing the warnings."
    exit 0
else
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your project is ready for deployment! 🚀"
    echo ""
    echo "To deploy, run: ./deploy-gcp.sh"
    exit 0
fi
