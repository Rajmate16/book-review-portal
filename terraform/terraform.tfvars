aws_region   = "us-east-1"
environment  = "dev"
project_name = "book-review-portal"

vpc_cidr        = "10.0.0.0/16"
private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

instance_type = "t3.micro"
db_username   = "admin"
# db_password should be set via environment variable or CLI
# export TF_VAR_db_password="YourSecurePassword123!"

key_name = "" # Set this to your EC2 key pair name if you want SSH access