# Book Review Portal

A full-stack book review application with React frontend, Python/Java microservices, and automated AWS deployment using Terraform with OIDC authentication.

## 🏗️ Architecture
- **Frontend**: React.js with modern UI components
- **Backend**: Python Flask (book service) + Java Spring Boot (review service)
- **Infrastructure**: Terraform with AWS OIDC deployment
- **CI/CD**: GitHub Actions with secure OIDC authentication

## 🚀 Features
- 📚 Book management and reviews
- 🔐 Secure OIDC authentication
- 🚀 Automated deployment pipeline
- 🛡️ Security best practices
- 📊 Microservices architecture

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Java 17+
- Docker (optional)

### Local Development

1. **Start React Frontend**
```bash
cd frontend/react-book-app
npm start
```

2. **Start Python Backend**
```bash
cd backend/python-book-service
python app.py
```

3. **Start Java Backend**
```bash
cd backend/java-review-service
mvn spring-boot:run
```

### Production Deployment
See [TERRAFORM_SETUP.md](TERRAFORM_SETUP.md) for AWS deployment instructions.

## 📁 Project Structure
```
├── frontend/react-book-app/     # React frontend
├── backend/python-book-service/ # Python Flask API
├── backend/java-review-service/ # Java Spring Boot API
├── terraform/                   # Infrastructure as Code
├── .github/workflows/          # CI/CD pipelines
└── docs/                       # Documentation
```

## 🔧 Technologies
- **Frontend**: React, Axios, React Router, Heroicons
- **Backend**: Python Flask, Java Spring Boot, MySQL
- **Infrastructure**: Terraform, AWS (EC2, RDS, S3)
- **CI/CD**: GitHub Actions, OIDC

## 📄 License
MIT License