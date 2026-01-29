# Terraform - AI Service Deployment

Deploy the MyTudo AI Service to a DigitalOcean Droplet.

## Prerequisites

1. [Terraform](https://terraform.io/downloads) installed (v1.0+)
2. DigitalOcean account with API token
3. Google Gemini API key
4. Docker image pushed to GitHub Container Registry

## Quick Start

```bash
# Initialize Terraform
terraform init

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Preview changes
terraform plan

# Deploy
terraform apply
```

## Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `do_token` | Yes | DigitalOcean API token |
| `gemini_api_key` | Yes | Google Gemini API key |
| `droplet_size` | No | Droplet size (default: `s-2vcpu-2gb`) |
| `region` | No | DO region (default: `sgp1`) |
| `ssh_public_key` | No | SSH public key for access |

## Outputs

After deployment:
- `ai_service_url` - URL to access the AI service
- `ssh_command` - SSH command to connect to Droplet

## Droplet Sizes

The AI service uses PyTorch and requires at least 2GB RAM:

| Size | vCPUs | RAM | Price |
|------|-------|-----|-------|
| `s-2vcpu-2gb` | 2 | 2GB | $18/mo |
| `s-2vcpu-4gb` | 2 | 4GB | $24/mo |
| `s-4vcpu-8gb` | 4 | 8GB | $48/mo |

## Docker Image

Build and push the Docker image to Docker Hub before deploying:

### 1. Authenticate with Docker Hub

```bash
docker login
```

### 2. Build and Push

Replace `<username>` with your Docker Hub username.

```bash
cd bg-remove-service

# Build the image
docker build -t <username>/ai-service:latest .

# Push the image
docker push <username>/ai-service:latest
```

> **Note:** Make sure the package visibility on GitHub is set to **Public** (or ensure the Droplet has a way to authenticate if Private).
