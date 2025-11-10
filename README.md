# 🧭 AI Travel Planner 运行指南

本项目是一个基于 Docker 部署的 AI 旅行规划应用。请按照以下步骤运行。

---

## 📦 前置准备

1. **确保已安装 Docker**  
   如果未安装，请前往 [Docker 官网](https://www.docker.com/) 下载并安装适合您系统的版本。

2. **准备环境变量文件**  
   **下载项目提供的 `travel-planner.env` 文件（位于教学支持系统的作业提交区域），并将其放置在您计划运行容器的目录中。**

---

## 🚀 启动应用

在 `travel-planner.env` 文件所在目录下打开命令行（CMD 或终端），依次执行以下命令：

### 1. 拉取镜像

```bash
docker pull crpi-m0t3qhte429avdh2.cn-hangzhou.personal.cr.aliyuncs.com/my-ai-apps/ai-travel-planner:latest
```

### 2. 运行容器

```bash
docker run --name ai-planner-instance -p 3000:3000 --env-file ./travel-planner.env -d crpi-m0t3qhte429avdh2.cn-hangzhou.personal.cr.aliyuncs.com/my-ai-apps/ai-travel-planner:latest
```

**参数说明：**

- `--name ai-planner-instance`：指定容器名称。

- `-p 3000:3000`：将容器的 3000 端口映射到本地 3000 端口。

- `--env-file ./travel-planner.env`：加载环境变量配置文件。

- `-d`：在后台运行容器。

---

## 🌐 访问应用

启动成功后，在浏览器中打开：

👉 [http://localhost:3000](http://localhost:3000/)

即可访问 AI Travel Planner 应用。

## 💡 提示

如需更新镜像，请执行：

```bash
docker pull crpi-m0t3qhte429avdh2.cn-hangzhou.personal.cr.aliyuncs.com/my-ai-apps/ai-travel-planner:latest
docker stop ai-planner-instance && docker rm ai-planner-instance
```

然后重新运行启动命令。
