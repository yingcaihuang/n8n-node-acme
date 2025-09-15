# n8n社区分享模板

## 🎉 新节点发布: ACME证书自动颁发

### 📝 分享内容

**标题**: 🆕 ACME证书自动颁发节点 - 支持6个主流DNS服务商验证

**内容**:
```
大家好！我刚刚发布了一个新的n8n社区节点，用于自动颁发SSL/TLS证书。

🔑 **主要功能**:
- 自动颁发Let's Encrypt证书
- 支持DNS-01挑战验证
- 支持6个主流DNS服务商
- 支持测试和生产环境
- 完整的错误处理和重试机制

🌐 **支持的DNS提供商**:
- Dnspod (腾讯云)
- 阿里云DNS
- Cloudflare
- AWS Route 53
- 百度云
- 华为云

⚡ **使用场景**:
- 自动化SSL证书管理
- 微服务证书颁发
- 开发环境证书配置
- 证书自动续期

📦 **安装方法**:
1. 在n8n设置中添加社区节点包: `n8n-nodes-acme`
2. 配置DNS提供商凭据
3. 在工作流中使用ACME Certificate节点

🔧 **配置示例**:
- Domain: example.com
- Email: admin@example.com
- DNS Provider: dnspod/aliyun/cloudflare/route53/baidu/huawei
- Use Staging: true (测试时)

📚 **文档**: https://github.com/your-username/n8n-node-acme
📦 **npm包**: https://www.npmjs.com/package/n8n-nodes-acme

有任何问题或建议欢迎反馈！🚀
```

### 🏷️ 标签建议
- `community-node`
- `ssl`
- `certificate`
- `acme`
- `lets-encrypt`
- `dns`
- `automation`

### 📍 发布位置
- n8n社区论坛: https://community.n8n.io/
- GitHub Discussions: https://github.com/n8n-io/n8n/discussions
- Reddit: https://www.reddit.com/r/n8n/

### 📸 截图建议
1. 节点配置界面
2. 工作流示例
3. 输出数据示例
4. 成功颁发证书的日志

### 🎯 目标受众
- 需要自动化SSL证书管理的开发者
- 使用n8n进行DevOps自动化的团队
- 需要证书自动续期的运维人员
- 微服务架构的开发者
