#!/bin/bash

# n8n-nodes-acme 发布准备脚本

echo "🚀 准备发布 n8n-nodes-acme v1.0.1"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告: 有未提交的更改"
    echo "请先提交所有更改:"
    echo "git add ."
    echo "git commit -m '准备发布 v1.0.1'"
    exit 1
fi

# 运行测试和构建
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 运行linting检查
echo "🔍 运行代码检查..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ 代码检查失败"
    exit 1
fi

# 创建npm包
echo "📦 创建npm包..."
npm pack

if [ $? -ne 0 ]; then
    echo "❌ 创建包失败"
    exit 1
fi

# 显示包信息
echo "✅ 包创建成功!"
echo "📁 包文件: n8n-nodes-acme-1.0.1.tgz"
echo "📊 包大小: $(ls -lh n8n-nodes-acme-1.0.1.tgz | awk '{print $5}')"

# 显示发布步骤
echo ""
echo "🎉 发布准备完成!"
echo ""
echo "📋 下一步操作:"
echo "1. 推送到GitHub:"
echo "   git push origin main"
echo ""
echo "2. 创建GitHub Release:"
echo "   - 访问: https://github.com/your-username/n8n-node-acme/releases/new"
echo "   - 标签: v1.0.1"
echo "   - 标题: n8n-nodes-acme v1.0.1"
echo "   - 上传: n8n-nodes-acme-1.0.1.tgz"
echo ""
echo "3. 发布到npm (可选):"
echo "   npm publish"
echo ""
echo "4. 在n8n社区分享:"
echo "   - 访问: https://community.n8n.io/"
echo "   - 分享项目链接和使用说明"
