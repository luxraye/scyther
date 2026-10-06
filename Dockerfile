# ─── Stage 1: Dependency Installation ───────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Stage 2: Build All Frontend Artifacts ──────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build:scyther && \
    npm run build:rubric && \
    npm run build:aegis && \
    npm run build:crucible && \
    npm run build:torrent

# ─── Stage 3: API Gateway & Event Bus Runner ────────────────────────────────
FROM node:22-alpine AS server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY server.ts ./
COPY src/ ./src/
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]

# ─── Stage 4: Scyther Citizen Donor Portal ──────────────────────────────────
FROM nginx:alpine AS app-scyther
COPY --from=builder /app/apps/scyther/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 5: Rubric National Operations Command ────────────────────────────
FROM nginx:alpine AS app-rubric
COPY --from=builder /app/apps/rubric/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 6: Aegis Clinical Transfusion Safety ─────────────────────────────
FROM nginx:alpine AS app-aegis
COPY --from=builder /app/apps/aegis/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 7: Crucible Serology & QC Fractionation ──────────────────────────
FROM nginx:alpine AS app-crucible
COPY --from=builder /app/apps/crucible/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 8: Torrent IoT Cold-Chain Logistics Hub ──────────────────────────
FROM nginx:alpine AS app-torrent
COPY --from=builder /app/apps/torrent/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
