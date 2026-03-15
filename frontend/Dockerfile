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

# ---- Production stage: Node.js Express server ----
# Uses server.js which handles security headers, gzip, API proxy, and SPA routing.
# Works on Railway ($PORT), Render ($PORT), and locally (defaults to 3000).
FROM node:20-alpine

WORKDIR /app

# Copy built app + server
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Install only production dependencies needed by server.js
RUN yarn install --frozen-lockfile --production

# Railway/Render assign PORT dynamically; default to 3000 for local usage
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "server.js"]
