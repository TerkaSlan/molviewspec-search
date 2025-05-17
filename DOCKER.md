# Docker Support for MolViewSpec Search Demo

This document explains how to build and run the MolViewSpec Search Demo using Docker.

## Using Docker

### Build and Run with Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:8080

### Manual Docker Commands

If you prefer not to use Docker Compose, you can use these commands instead:

```bash
# Build the Docker image
docker build -t molviewspec-search .

# Run the container
docker run -d -p 8080:8080 --name molviewspec-search molviewspec-search

# Stop the container
docker stop molviewspec-search

# Remove the container
docker rm molviewspec-search
```

## Security Features

This Docker setup includes several security features:

- Uses `nginxinc/nginx-unprivileged` which runs NGINX as a non-root user
- Runs on port 8080 instead of privileged port 80
- Implements security headers in the nginx configuration:
  - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
  - `X-XSS-Protection` - Helps prevent XSS attacks in older browsers
  - `X-Frame-Options: DENY` - Prevents the page from being displayed in an iframe
  - `Referrer-Policy` - Controls how much referrer information is included
- Container healthcheck for better orchestration support
- Follows container security best practices

## Development with Docker

For development purposes, you can mount your local code into the container:

```bash
docker run -d -p 8080:8080 -v $(pwd)/src:/app/src --name molviewspec-search-dev molviewspec-search
```

## Environment Configuration

The Docker container uses the production build of the React application. If you need to configure environment variables, you can add them to your `.env` file before building the Docker image.

## Troubleshooting

- If you see a "port is already allocated" error, make sure port 8080 is not in use by another service.
- If the application doesn't load, check the logs: `docker logs molviewspec-search` 