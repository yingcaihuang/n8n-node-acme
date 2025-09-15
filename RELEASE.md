# 发布说明

## n8n-nodes-acme v1.1.0

### 📦 包信息
- **包名**: `n8n-nodes-acme`
- **版本**: `1.1.0`
- **大小**: 42.4 kB (压缩后)
- **文件数**: 24个文件

### 🚀 功能特性
- ✅ ACME证书自动颁发
- ✅ DNS-01挑战验证
- ✅ 支持4个主流DNS服务商：Dnspod、阿里云、Cloudflare、AWS Route 53
- ✅ Let's Encrypt测试和生产环境
- ✅ RSA和ECDSA密钥类型支持
- ✅ 完整的错误处理和重试机制

### 📋 安装方法

#### 方法1: 通过npm安装
```bash
npm install n8n-nodes-acme
```

#### 方法2: 在n8n中安装
1. 打开n8n设置
2. 转到"社区节点"
3. 添加包名: `n8n-nodes-acme`
4. 点击安装

### 🔧 配置要求

#### DNS提供商凭据
- **Dnspod**: 需要API ID和API Token
- **阿里云**: 需要Access Key ID和Access Key Secret
- **Cloudflare**: 需要API Token和Zone ID
- **AWS Route 53**: 需要Access Key ID、Secret Access Key和Hosted Zone ID

#### 系统要求
- Node.js 18+
- n8n 1.0+
- 域名DNS管理权限

### 📖 使用示例

1. **配置凭据**
   - 在n8n中创建DNS提供商凭据

2. **创建工作流**
   ```
   [开始] -> [ACME Certificate] -> [保存证书]
   ```

3. **配置节点**
   - Domain: `example.com`
   - Email: `admin@example.com`
   - DNS Provider: `dnspod`、`aliyun`、`cloudflare` 或 `route53`
   - Use Staging: `true` (测试时)

### 🐛 已知问题
- 无

### 🔄 更新日志
详见 [CHANGELOG.md](./CHANGELOG.md)

### 📞 支持
- GitHub Issues: [项目地址]
- 文档: [README.md](./README.md)

### 📄 许可证
MIT License
