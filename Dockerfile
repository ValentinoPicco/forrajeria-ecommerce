# 1. Etapa de dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos archivos de configuración de paquetes
COPY package.json package-lock.json* ./
# Instalamos dependencias (usamos frozen-lockfile para asegurar versiones exactas)
RUN npm ci

# 2. Etapa de construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generamos el cliente de Prisma (Clave para que TS reconozca tu base de datos)
RUN npx prisma generate

# Desactivamos la telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 3. Etapa de ejecución (Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Creamos un usuario de sistema para no correr la app como root (seguridad)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo lo necesario para que la app funcione
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
