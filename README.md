# n8n-nodes-acme

一个用于n8n的ACME证书颁发节点，支持通过DNS记录验证自动获取SSL/TLS证书。

## 功能特性

- 🔒 自动颁发SSL/TLS证书
- 🌐 支持DNS-01挑战验证
- 🏢 支持6个主流DNS服务商：Dnspod、阿里云、Cloudflare、AWS Route 53、百度云、华为云
- 🧪 支持Let's Encrypt测试环境
- 🔑 支持RSA和ECDSA密钥类型
- 📊 返回完整的证书信息
- 🎨 优化的用户界面，动态显示凭证配置

## 安装

1. 将包安装到您的n8n实例：
```bash
npm install n8n-nodes-acme
```

2. 在n8n中启用社区节点包：
   - 转到设置 > 社区节点
   - 添加包名：`n8n-nodes-acme`

## 使用方法

### 1. 配置DNS提供商凭据

#### Dnspod配置
- 转到Dnspod控制台
- 获取API ID和API Token
- 在n8n凭据中添加Dnspod API凭据

#### 阿里云配置
- 转到阿里云控制台
- 创建Access Key ID和Access Key Secret
- 确保具有DNS管理权限
- 在n8n凭据中添加阿里云API凭据

#### Cloudflare配置
- 转到Cloudflare控制台
- 创建API Token，权限包括：Zone:Read, DNS:Edit
- 获取Zone ID
- 在n8n凭据中添加Cloudflare API凭据

#### AWS Route 53配置
- 转到AWS控制台
- 创建IAM用户，权限包括：Route53ChangeResourceRecordSets
- 获取Access Key ID和Secret Access Key
- 获取Hosted Zone ID
- 在n8n凭据中添加AWS Route 53 API凭据

#### 百度云配置
- 转到百度云控制台
- 创建Access Key ID和Secret Access Key
- 确保具有DNS管理权限
- 选择区域（北京/广州/苏州）
- 在n8n凭据中添加百度云API凭据

#### 华为云配置
- 转到华为云控制台
- 创建Access Key ID和Secret Access Key
- 获取项目ID
- 确保具有DNS管理权限
- 在n8n凭据中添加华为云API凭据

### 2. 使用ACME证书节点

1. 在n8n工作流中添加"ACME Certificate"节点
2. 配置以下参数：
   - **DNS Provider**: 首先选择DNS服务商（Dnspod、阿里云、Cloudflare、AWS Route 53、百度云或华为云）
   - **Credential to connect with**: 选择对应的API凭据（根据DNS Provider动态显示）
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

### 阿里云DNS
- 官方网站：https://www.aliyun.com/
- API文档：https://help.aliyun.com/document_detail/29739.html
- 需要：Access Key ID 和 Access Key Secret

### Cloudflare
- 官方网站：https://www.cloudflare.com/
- API文档：https://developers.cloudflare.com/api/
- 需要：API Token 和 Zone ID

### AWS Route 53
- 官方网站：https://aws.amazon.com/route53/
- API文档：https://docs.aws.amazon.com/Route53/latest/APIReference/
- 需要：Access Key ID、Secret Access Key 和 Hosted Zone ID

### 百度云
- 官方网站：https://cloud.baidu.com/
- API文档：https://cloud.baidu.com/doc/DNS/index.html
- 需要：Access Key ID、Secret Access Key 和 Region

### 华为云
- 官方网站：https://www.huaweicloud.com/
- API文档：https://support.huaweicloud.com/api-dns/
- 需要：Access Key ID、Secret Access Key、Region 和 Project ID

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
