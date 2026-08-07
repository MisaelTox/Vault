variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of the AWS key pair for SSH access"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "vault"
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH into the instance (e.g. your IP as x.x.x.x/32)"
  type        = string
}
