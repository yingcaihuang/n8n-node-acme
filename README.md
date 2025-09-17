# n8n-nodes-acme

一个用于n8n的ACME证书颁发节点，支持通过DNS记录验证自动获取SSL/TLS证书。

## 功能特性

- 🔒 自动颁发SSL/TLS证书
- 🌐 支持DNS-01挑战验证
- 🏢 支持阿里云DNS和Dnspod DNS服务商
- 🧪 支持Let's Encrypt测试环境
- 🔑 支持RSA和ECDSA密钥类型
- 📊 返回完整的证书信息
- 🎨 动态凭证选择，根据DNS提供商显示对应配置
- 🎯 现代化SVG图标设计，美观易识别

## 安装

1. 将包安装到您的n8n实例：
```bash
npm install n8n-nodes-acme
```

2. 在n8n中启用社区节点包：
   - 转到设置 > 社区节点
   - 添加包名：`n8n-nodes-acme`

## 使用方法

### 1. 配置Dnspod凭据

#### Dnspod配置
- 转到Dnspod控制台
- 获取API ID和API Token
- 在n8n凭据中添加Dnspod API凭据

### 2. 使用ACME证书节点

1. 在n8n工作流中添加"ACME Certificate"节点
2. 配置以下参数：
   - **DNS Provider**: 选择Dnspod（默认选项）
   - **Credential to connect with**: 选择Dnspod API凭据
   - **Domain**: 要申请证书的域名
   - **Email**: 用于ACME账户注册的邮箱
   - **Use Staging Environment**: 是否使用测试环境（建议先测试）
   - **Private Key Size**: 私钥长度（2048或4096位）
   - **Key Type**: 密钥类型（RSA或ECDSA）

### 3. 输出数据

节点成功执行后会返回包含以下信息的JSON数据：

```json
{
  "domain": "example.com",
  "email": "admin@example.com",
  "dnsProvider": "dnspod",
  "staging": true,
  "certificate": {
    "privateKey": "-----BEGIN PRIVATE KEY-----...",
    "certificate": "-----BEGIN CERTIFICATE-----...",
    "chain": "-----BEGIN CERTIFICATE-----...",
    "fullChain": "-----BEGIN CERTIFICATE-----...",
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validTo": "2024-04-01T00:00:00.000Z",
    "issuer": "Let's Encrypt Authority X3",
    "subject": "example.com",
    "serialNumber": "1234567890"
  }
}
```

## 支持的DNS提供商

### Dnspod
- 官方网站：https://www.dnspod.cn/
- API文档：https://docs.dnspod.cn/api/
- 需要：API ID 和 API Token

## 注意事项

1. **域名验证**：确保您对域名具有DNS管理权限
2. **API限制**：注意DNS提供商的API调用频率限制
3. **测试环境**：建议先在测试环境中验证配置
4. **证书有效期**：Let's Encrypt证书有效期为90天
5. **自动续期**：建议设置定期工作流进行证书续期

## 开发

### 构建项目
```bash
npm run build
```

### 开发模式
```bash
npm run dev
```

### 代码格式化
```bash
npm run format
```

### 代码检查
```bash
npm run lint
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)
