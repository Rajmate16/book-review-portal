# Terraform AWS Deployment with GitHub Actions OIDC

This guide explains how to set up automated Terraform deployments to AWS using GitHub Actions with OIDC (OpenID Connect) authentication.

## Prerequisites

- AWS Account with appropriate permissions
- GitHub repository
- Terraform code in the `terraform/` directory

## Setup Instructions

### 1. Create AWS IAM OIDC Provider

First, create an OIDC provider in AWS for GitHub Actions:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create IAM Role for GitHub Actions

Create an IAM role that GitHub Actions can assume:

```bash
# Create the role
aws iam create-role \
  --role-name GitHubActionsTerraformRole \
  --assume-role-policy-document file://aws-oidc-trust-policy.json

# Attach necessary policies (adjust based on your Terraform resources)
aws iam attach-role-policy \
  --role-name GitHubActionsTerraformRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

**Note:** Replace `YOUR_AWS_ACCOUNT_ID`, `YOUR_GITHUB_USERNAME`, and `YOUR_REPO_NAME` in the trust policy with your actual values.

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secret:
   - `AWS_ROLE_ARN`: The ARN of the IAM role you created (e.g., `arn:aws:iam::123456789012:role/GitHubActionsTerraformRole`)

### 4. Update Terraform Configuration

Ensure your Terraform configuration includes:

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}
```

### 5. Workflow Features

The GitHub Actions workflow includes:

#### Automatic Triggers
- **Push to main/develop**: Triggers plan and apply (main only)
- **Pull requests**: Triggers plan only for review
- **Path filtering**: Only runs when Terraform files change

#### Jobs
1. **terraform-plan**: 
   - Validates and plans Terraform changes
   - Uploads plan as artifact
   - Runs on all branches

2. **terraform-apply**:
   - Applies changes to production
   - Only runs on main branch pushes
   - Uses the plan from the previous job

3. **terraform-destroy** (Manual):
   - Destroys infrastructure
   - Manual trigger only
   - Requires explicit confirmation

#### Security Features
- **OIDC Authentication**: No long-term AWS credentials stored
- **Least Privilege**: Uses IAM roles with specific permissions
- **Plan Review**: Changes are planned before applying
- **Environment Separation**: Different environments for different branches

### 6. Usage

#### Automatic Deployment
1. Push changes to `main` branch
2. Workflow automatically plans and applies changes
3. Monitor the Actions tab for progress

#### Manual Destroy
1. Go to Actions → Terraform Deploy to AWS
2. Click "Run workflow"
3. Select "destroy" action
4. Confirm the destruction

### 7. Monitoring

- Check the Actions tab for workflow status
- Review plan output before apply
- Monitor AWS resources in the console
- Set up CloudWatch alarms for critical resources

### 8. Best Practices

1. **State Management**: Use S3 backend for state storage
2. **Secrets**: Store sensitive values in AWS Secrets Manager
3. **Tagging**: Tag all resources for cost tracking
4. **Backup**: Regularly backup Terraform state
5. **Testing**: Test changes in development environment first

### 9. Troubleshooting

#### Common Issues

1. **Permission Denied**: Check IAM role permissions
2. **OIDC Trust Policy**: Verify GitHub repository name
3. **State Lock**: Check for concurrent Terraform operations
4. **Network Issues**: Ensure VPC and security group configurations

#### Debug Commands

```bash
# Check OIDC provider
aws iam get-open-id-connect-provider --open-id-connect-provider-arn arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com

# Check role trust policy
aws iam get-role --role-name GitHubActionsTerraformRole

# List attached policies
aws iam list-attached-role-policies --role-name GitHubActionsTerraformRole
```

## Security Considerations

- Use least privilege IAM policies
- Regularly rotate OIDC provider certificates
- Monitor AWS CloudTrail for API calls
- Implement proper resource tagging
- Use AWS Config for compliance monitoring

## Cost Optimization

- Use spot instances where appropriate
- Implement auto-scaling policies
- Monitor and optimize resource usage
- Set up billing alerts
- Use reserved instances for predictable workloads