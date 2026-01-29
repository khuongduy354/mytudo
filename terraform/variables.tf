# Required Variables
variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key for AI attribute extraction"
  type        = string
  sensitive   = true
}

# Optional Variables with Defaults
variable "droplet_name" {
  description = "Name of the Droplet"
  type        = string
  default     = "mytudo-ai-service"
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1" # Singapore - closest to Vietnam
}

variable "droplet_size" {
  description = "Droplet size slug. Minimum 2GB RAM recommended for PyTorch."
  type        = string
  default     = "s-2vcpu-2gb" # 2 vCPU, 2GB RAM - $18/month
}

variable "ssh_public_key" {
  description = "SSH public key content for Droplet access. Leave empty to use existing keys."
  type        = string
  default     = ""
}

variable "existing_ssh_key_ids" {
  description = "List of existing SSH key IDs in DigitalOcean (if not providing new key)"
  type        = list(string)
  default     = []
}

variable "ssh_allowed_ips" {
  description = "IP addresses allowed to SSH into the Droplet"
  type        = list(string)
  default     = ["0.0.0.0/0", "::/0"] # Allow all by default, restrict in production
}

variable "client_url" {
  description = "Client URL for CORS configuration"
  type        = string
  default     = "https://mytudo.onrender.com"
}

variable "docker_image" {
  description = "Docker image name (e.g., username/repo)"
  type        = string
  default     = "khuongduy354/ai-service"
}

variable "create_reserved_ip" {
  description = "Create a reserved (static) IP for the Droplet"
  type        = bool
  default     = false
}
