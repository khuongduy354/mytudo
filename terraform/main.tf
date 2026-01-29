terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "digitalocean" {
  token = var.do_token
}

# SSH Key for Droplet access
resource "digitalocean_ssh_key" "ai_service" {
  count      = var.ssh_public_key != "" ? 1 : 0
  name       = "ai-service-key"
  public_key = var.ssh_public_key
}

# Cloud-init script for Docker setup
locals {
  cloud_init = <<-EOT
    #cloud-config
    package_update: true
    package_upgrade: true
    packages:
      - docker.io
      - docker-compose
    runcmd:
      - systemctl enable docker
      - systemctl start docker
      - usermod -aG docker root
      # Pull and run the AI service container
      - mkdir -p /opt/ai-service
      - cd /opt/ai-service
      - |
        cat > docker-compose.yml << 'EOF'
        version: '3.8'
        services:
          ai-service:
            image: ${var.docker_image}:latest
            container_name: ai-service
            restart: always
            ports:
              - "80:8001"
            environment:
              - PORT=8001
              - GEMINI_API_KEY=${var.gemini_api_key}
              - CLIENT_URL=${var.client_url}
            healthcheck:
              test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
              interval: 30s
              timeout: 10s
              retries: 3
        EOF
      - docker-compose up -d
  EOT
}

# Droplet for AI Service
resource "digitalocean_droplet" "ai_service" {
  name     = var.droplet_name
  region   = var.region
  size     = var.droplet_size
  image    = "ubuntu-22-04-x64"
  
  ssh_keys = var.ssh_public_key != "" ? [digitalocean_ssh_key.ai_service[0].fingerprint] : var.existing_ssh_key_ids

  user_data = local.cloud_init

  tags = ["ai-service", "production"]

  lifecycle {
    create_before_destroy = true
  }
}

# Firewall for the Droplet
resource "digitalocean_firewall" "ai_service" {
  name = "ai-service-firewall"

  droplet_ids = [digitalocean_droplet.ai_service.id]

  # Allow SSH
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = var.ssh_allowed_ips
  }

  # Allow HTTP (AI service)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow HTTPS
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow all outbound
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# Optional: Reserved IP for stable address
resource "digitalocean_reserved_ip" "ai_service" {
  count  = var.create_reserved_ip ? 1 : 0
  region = var.region
}

resource "digitalocean_reserved_ip_assignment" "ai_service" {
  count      = var.create_reserved_ip ? 1 : 0
  ip_address = digitalocean_reserved_ip.ai_service[0].ip_address
  droplet_id = digitalocean_droplet.ai_service.id
}
