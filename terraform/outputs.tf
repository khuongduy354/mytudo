output "droplet_ip" {
  description = "Public IP address of the AI service Droplet"
  value       = digitalocean_droplet.ai_service.ipv4_address
}

output "droplet_id" {
  description = "ID of the AI service Droplet"
  value       = digitalocean_droplet.ai_service.id
}

output "reserved_ip" {
  description = "Reserved IP address (if created)"
  value       = var.create_reserved_ip ? digitalocean_reserved_ip.ai_service[0].ip_address : null
}

output "ai_service_url" {
  description = "URL to access the AI service"
  value       = "http://${var.create_reserved_ip ? digitalocean_reserved_ip.ai_service[0].ip_address : digitalocean_droplet.ai_service.ipv4_address}"
}

output "ssh_command" {
  description = "SSH command to connect to the Droplet"
  value       = "ssh root@${var.create_reserved_ip ? digitalocean_reserved_ip.ai_service[0].ip_address : digitalocean_droplet.ai_service.ipv4_address}"
}
