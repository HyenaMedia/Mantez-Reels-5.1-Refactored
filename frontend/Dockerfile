FROM node:20-alpine AS builder

WORKDIR /app

# Install Chromium for react-snap pre-rendering
RUN apk add --no-cache chromium

# Tell puppeteer (used by react-snap) to use the system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build args for environment variables
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Build the app — postbuild copies the blank SPA shell then runs react-snap
RUN yarn build

# ---- Production stage: nginx ----
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

# BACKEND_HOST defaults to "portfolio-backend" (Docker Compose service name).
# Override to "backend" for DigitalOcean App Platform (matches the app.yaml service name).
ARG BACKEND_HOST=portfolio-backend
ENV BACKEND_HOST=${BACKEND_HOST}
# Only substitute ${BACKEND_HOST} — prevents envsubst from clobbering nginx vars like $host, $uri
ENV NGINX_ENVSUBST_TEMPLATE_VARS=BACKEND_HOST

# Write nginx config template — uses ${BACKEND_HOST} substituted at container start via envsubst.
# The nginx:alpine image automatically processes /etc/nginx/templates/*.conf.template on startup.
RUN mkdir -p /etc/nginx/templates
RUN printf 'server {\n\
    listen 80;\n\
\n\
    # --- Dynamic SEO files (served fresh from backend without a rebuild) ---\n\
    location = /robots.txt {\n\
        proxy_pass http://${BACKEND_HOST}:8001/api/settings/robots.txt;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
        add_header Cache-Control "public, max-age=3600, must-revalidate";\n\
    }\n\
    location = /llms.txt {\n\
        proxy_pass http://${BACKEND_HOST}:8001/api/settings/llms.txt;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
        add_header Cache-Control "public, max-age=3600, must-revalidate";\n\
    }\n\
    location = /sitemap.xml {\n\
        proxy_pass http://${BACKEND_HOST}:8001/api/settings/sitemap.xml;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
        add_header Cache-Control "public, max-age=3600, must-revalidate";\n\
    }\n\
\n\
    # --- API proxy ---\n\
    location /api/ {\n\
        proxy_pass http://${BACKEND_HOST}:8001/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
\n\
    # --- Static assets (1 year cache) ---\n\
    location /static/ {\n\
        root /usr/share/nginx/html;\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # --- SPA routing (catch-all) ---\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
