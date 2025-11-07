# =================================================================
# STAGE 1: Builder
# =================================================================
FROM node:20-alpine AS builder

# 1. 定义所有需要的构建时参数
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_AMAP_KEY
# 注意：我们在这里不需要 ALIYUN_..._KEY，因为它只在运行时需要

WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci
COPY . .

# 2. 只设置 PUBLIC 环境变量，用于 next build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_AMAP_KEY=$NEXT_PUBLIC_AMAP_KEY

RUN npm run build

# =================================================================
# STAGE 2: Runner
# =================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# 3. 关键：为运行阶段也定义 ARG，以便接收服务器端密钥
ARG ALIYUN_DASHSCOPE_API_KEY

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

RUN npm install --omit=dev

# 4. 关键：在运行阶段设置所有需要的环境变量
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
# 将 ARG 的值赋给最终运行时的环境变量
ENV ALIYUN_DASHSCOPE_API_KEY=$ALIYUN_DASHSCOPE_API_KEY
# PUBLIC 变量也需要在运行时提供，以防万一（特别是对于 SSR）
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_AMAP_KEY=$NEXT_PUBLIC_AMAP_KEY

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]