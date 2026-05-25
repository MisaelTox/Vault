output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.vault.id
}

output "public_ip" {
  description = "Elastic IP address of the Vault server"
  value       = aws_eip.vault.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i <your-key.pem> ubuntu@${aws_eip.vault.public_ip}"
}
