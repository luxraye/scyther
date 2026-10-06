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
RUN npm run build && \
    npm run build:scyther && \
    npm run build:rubric && \
    npm run build:aegis && \
    npm run build:crucible && \
    npm run build:torrent

# ─── Stage 3: Standalone Scyther Citizen Donor Portal (Nginx) ───────────────
FROM nginx:alpine AS app-scyther
COPY --from=builder /app/apps/scyther/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 4: Standalone Rubric National Operations Command (Nginx) ─────────
FROM nginx:alpine AS app-rubric
COPY --from=builder /app/apps/rubric/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 5: Standalone Aegis Clinical Transfusion Safety (Nginx) ──────────
FROM nginx:alpine AS app-aegis
COPY --from=builder /app/apps/aegis/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 6: Standalone Crucible Serology & QC Fractionation (Nginx) ───────
FROM nginx:alpine AS app-crucible
COPY --from=builder /app/apps/crucible/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 7: Standalone Torrent IoT Cold-Chain Logistics Hub (Nginx) ───────
FROM nginx:alpine AS app-torrent
COPY --from=builder /app/apps/torrent/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 8: Sovereign Suite Gateway & Unified Runner (Cloud Run Default) ──
# This is the final stage, so default `docker build` (Cloud Run / Cloud Build)
# deploys the complete unified suite with the API Gateway, Event Bus, and all 5 apps.
FROM node:22-alpine AS server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/scyther/dist ./apps/scyther/dist
COPY --from=builder /app/apps/rubric/dist ./apps/rubric/dist
COPY --from=builder /app/apps/aegis/dist ./apps/aegis/dist
COPY --from=builder /app/apps/crucible/dist ./apps/crucible/dist
COPY --from=builder /app/apps/torrent/dist ./apps/torrent/dist
COPY package*.json ./
COPY tsconfig.json ./
COPY server.ts ./
COPY src/ ./src/
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npx", "tsx", "server.ts"]
