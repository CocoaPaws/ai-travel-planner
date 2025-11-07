# =================================================================
# STAGE 1: Builder - 构建阶段
# 在这里安装依赖并构建 Next.js 应用
# =================================================================

# ✅ 使用官方 Node.js 镜像（通过代理访问 docker.io）
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 仅复制依赖定义文件（利用缓存）
COPY package*.json ./

# ✅ 使用国内 npm 镜像，加快依赖安装
RUN npm config set registry https://registry.npmmirror.com \
    && npm ci

# 复制项目源代码
COPY . .

# 构建 Next.js 应用（生成 .next）
RUN npm run build


# =================================================================
# STAGE 2: Runner - 运行阶段
# 这里运行构建好的生产环境应用
# =================================================================

FROM node:20-alpine AS runner

# 设置工作目录
WORKDIR /app

# 创建非 root 用户（安全运行）
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001
USER nextjs

# 从构建阶段复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 设置环境变量
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
