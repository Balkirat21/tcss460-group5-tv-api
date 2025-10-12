# Cloud Hosting Options for Node.js/Express Web APIs

This document explores free hosting options for Node.js/Express applications with PostgreSQL database support, tailored to the requirements of our backend project.

## Option 1: Render

**Website:** https://render.com

### Overview
Render is a modern cloud platform that provides free hosting for web services, static sites, and PostgreSQL databases. It offers automatic deployments from Git repositories and built-in SSL certificates.

### Pros
- **Easy Setup**: Simple deployment process directly from GitHub repositories
- **Automatic Deployments**: Automatically deploys when you push to your Git repository
- **Free PostgreSQL Database**: Includes a free PostgreSQL database tier (90 days, then expires)
- **Zero Configuration SSL**: Automatic HTTPS certificates for all deployments
- **Good Documentation**: Clear and comprehensive documentation for beginners
- **Custom Domains**: Support for custom domain names on the free tier
- **Build & Deploy Logs**: Detailed logs to troubleshoot deployment issues
- **No Credit Card Required**: Can start using the free tier without payment information

### Cons
- **Cold Starts**: Free tier services spin down after 15 minutes of inactivity, resulting in slow initial response times (30+ seconds)
- **Limited Resources**: Free tier has 512 MB RAM and shared CPU
- **Build Time Limits**: Limited build minutes per month on free tier
- **Database Limitations**: Free PostgreSQL database expires after 90 days and has storage limits
- **Performance**: Slower performance compared to paid tiers due to resource constraints
- **Monthly Restarts**: Services may restart periodically for maintenance

### Demo Test
- Below are the logs from a successful deployment test of a sample web-api we created for Render.

- Upon visiting the root endpoint, the API returns the expected JSON response: {"message":"Welcome to Group 5 TV API!"}

## Option 2:
