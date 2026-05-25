#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add ubuntu user to docker group (no need for sudo)
usermod -aG docker ubuntu

# Install git
apt-get install -y git

# Create app directory
mkdir -p /home/ubuntu/vault
chown ubuntu:ubuntu /home/ubuntu/vault
