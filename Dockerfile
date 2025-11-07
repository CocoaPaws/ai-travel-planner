# =================================================================
# STAGE 1: Builder - 构建阶段
# =================================================================
FROM node:20-alpine AS builder

# 1. 定义构建时参数，用于接收来自 GitHub Actions Secrets 的值
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_AMAP_KEY
ARG ALIYUN_DASHSCOPE_API_KEY

WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci
COPY . .

# 2. 将接收到的 ARG 设置为环境变量，以便 `npm run build` 可以访问
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_AMAP_KEY=$NEXT_PUBLIC_AMAP_KEY
ENV ALIYUN_DASHSCOPE_API_KEY=$ALIYUN_DASHSCOPE_API_KEY

# 构建 Next.js 应用
RUN npm run build


# =================================================================
# STAGE 2: Runner - 运行阶段
# =================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# 从构建阶段复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 3. 在运行阶段只安装生产依赖，不再复制整个 node_modules
RUN npm config set registry https://registry.npmmirror.com && npm install --omit=dev

# 切换到非 root 用户
USER nextjs

# 环境变量
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]