# n8n社区分享帖子

## 🎉 新节点发布: ACME证书自动颁发节点 - 支持6个主流DNS服务商验证

大家好！我刚刚发布了一个新的n8n社区节点，用于自动颁发SSL/TLS证书。

### 🔑 主要功能:
- 自动颁发Let's Encrypt证书
- 支持DNS-01挑战验证
- 支持6个主流DNS服务商
- 支持测试和生产环境
- 完整的错误处理和重试机制

### 🌐 支持的DNS提供商:
- Dnspod (腾讯云)
- 阿里云DNS
- Cloudflare
- AWS Route 53
- 百度云 (新增)
- 华为云 (新增)

### ⚡ 使用场景:
- 自动化SSL证书管理
- 微服务证书颁发
- 开发环境证书配置
- 证书自动续期

### 📦 安装方法:
1. 在n8n设置中添加社区节点包: `n8n-nodes-acme`
2. 配置DNS提供商凭据
3. 在工作流中使用ACME Certificate节点

### 🔧 配置示例:
- Domain: example.com
- Email: admin@example.com
- DNS Provider: dnspod/aliyun/cloudflare/route53/baidu/huawei
- Use Staging: true (测试时)

### 📚 文档: 
- GitHub: https://github.com/your-username/n8n-node-acme
- npm包: https://www.npmjs.com/package/n8n-nodes-acme

有任何问题或建议欢迎反馈！🚀

---

**标签建议**: #community-node #ssl #certificate #acme #lets-encrypt #dns #automation
