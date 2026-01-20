# Render.com Deployment Guide

Complete guide for deploying mytudo to Render.com.

# Prerequisites

- GitHub repository with your code
- Supabase Cloud account and project
- Render.com account

# Step 1: Prepare Supabase Cloud

1. Go to https://supabase.com and create a new project
2. Wait for project to be provisioned
3. Get your credentials from Settings > API:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_KEY)

4. Apply migrations:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

# Step 2: Push to GitHub

```bash
git add .
git commit -m "Add Docker containerization"
git push origin main
```

# Step 3: Deploy to Render

# Option A: Using Blueprint (Recommended)

1. Go to https://render.com/dashboard
2. Click "New" > "Blueprint"
3. Connect your GitHub repository
4. Render will detect render.yaml
5. Configure environment variables (see below)
6. Click "Apply"

# Option B: Manual Service Creation

Create each service individually:

# 1. Client Service
- Name: mytudo-client
- Environment: Docker
- Build Command: (automatic from Dockerfile)
- Dockerfile Path: ./client/Dockerfile
- Docker Context: .
- Environment Variables:
  - VITE_API_URL: https://mytudo-server.onrender.com
  - VITE_SUPABASE_URL: <your-supabase-url>
  - VITE_SUPABASE_ANON_KEY: <your-anon-key>

# 2. Server Service
- Name: mytudo-server
- Environment: Docker
- Dockerfile Path: ./server/Dockerfile
- Docker Context: .
- Health Check Path: /api/health
- Environment Variables:
  - NODE_ENV: production
  - PORT: 3000
  - SUPABASE_URL: <your-supabase-url>
  - SUPABASE_ANON_KEY: <your-anon-key>
  - SUPABASE_SERVICE_KEY: <your-service-key>
  - BG_REMOVE_SERVICE_URL: https://mytudo-bg-remove.onrender.com

# 3. BG Remove Service
- Name: mytudo-bg-remove
- Environment: Docker
- Dockerfile Path: ./bg-remove-service/Dockerfile
- Docker Context: ./bg-remove-service
- Health Check Path: /
- Plan: Starter (recommended for ML models)

# Step 4: Configure Environment Variables

In Render dashboard for each service:

# mytudo-client
```
VITE_API_URL=https://mytudo-server.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

# mytudo-server
```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
BG_REMOVE_SERVICE_URL=https://mytudo-bg-remove.onrender.com
```

# mytudo-bg-remove
```
PYTHONUNBUFFERED=1
```

# Step 5: Verify Deployment

1. Wait for all services to deploy (5-10 minutes first time)
2. Check logs in Render dashboard
3. Test health endpoints:
   - https://mytudo-server.onrender.com/api/health
   - https://mytudo-bg-remove.onrender.com/

4. Access your app:
   - https://mytudo-client.onrender.com

# Step 6: Configure Custom Domain (Optional)

1. In Render dashboard, go to mytudo-client settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

# Troubleshooting

# Build Failures

Check logs in Render dashboard:
- Client build logs for Vite errors
- Server build logs for TypeScript errors
- BG Remove logs for Python dependency issues

# Environment Variable Issues

Ensure all required environment variables are set:
```bash
# Check in Render dashboard > Service > Environment
```

# Health Check Failures

Server must respond at /api/health:
```bash
curl https://mytudo-server.onrender.com/api/health
```

# Cold Start Issues

Render free tier spins down after 15min inactivity:
- First request will be slow (30s-1min)
- Upgrade to Starter plan for always-on

# Database Connection Issues

Verify Supabase credentials:
- Check SUPABASE_URL format
- Ensure SUPABASE_SERVICE_KEY is correct
- Check Supabase project is active

# Deployment Updates

# Automatic Deployments

Render auto-deploys on git push to main branch:
```bash
git push origin main
# Render will automatically rebuild and deploy
```

# Manual Deployments

In Render dashboard:
1. Go to service
2. Click "Manual Deploy" > "Deploy latest commit"

# Rollback

In Render dashboard:
1. Go to service > Deploys
2. Find previous successful deploy
3. Click "..." > "Redeploy"

# Monitoring

# Logs

View in Render dashboard:
- Live logs: Service > Logs tab
- Historical logs: Service > Events

# Metrics

Render provides:
- CPU usage
- Memory usage
- Request rate
- Response time

Access: Service > Metrics tab

# Alerts

Configure in Render dashboard:
- Service > Settings > Alerts
- Set up email notifications for:
  - Failed deploys
  - Health check failures
  - High resource usage

# Cost Optimization

# Free Tier

- Client (static site): Free
- Server: Free (spins down after 15min)
- BG Remove: Requires Starter plan ($7/month) for ML models

Total: ~$7/month

# Starter Plan

- All services: $7/month each
- Always-on
- Better performance
- More resources

Total: ~$21/month

# Scaling

For production traffic:
1. Upgrade to Starter plan
2. Enable auto-scaling
3. Monitor metrics
4. Adjust resources as needed

# Best Practices

1. Use environment groups in Render for shared variables
2. Enable auto-deploy for continuous deployment
3. Set up health checks for all services
4. Monitor logs regularly
5. Use Render's preview environments for testing
6. Keep Supabase and Render in same region for performance

# Support

- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: GitHub repository issues
