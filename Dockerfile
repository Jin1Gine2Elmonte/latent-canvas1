# Multi-stage production build for Latent Canvas Studio
FROM node:20-slim AS builder

WORKDIR /app

# Install native dependencies required by @resvg/resvg-js
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies for resvg rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/latent_canvas ./latent_canvas
COPY --from=builder /app/prompts ./prompts
COPY --from=builder /app/pyproject.toml ./
COPY --from=builder /app/requirements.txt ./
COPY --from=builder /app/README.md ./
COPY --from=builder /app/GRANT_PROPOSAL.md ./
COPY --from=builder /app/LICENSE ./

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
