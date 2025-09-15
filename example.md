# 使用示例

## 基本工作流

1. **配置DNS提供商凭据**
   - 在n8n中创建Dnspod或阿里云API凭据
   - 确保具有域名管理权限

2. **创建工作流**
   ```
   [开始] -> [ACME Certificate节点] -> [保存证书]
   ```

3. **配置ACME Certificate节点**
   - Domain: `example.com`
   - Email: `admin@example.com`
   - DNS Provider: `dnspod` 或 `aliyun`
   - Use Staging Environment: `true` (测试时)
   - Private Key Size: `2048`
   - Key Type: `RSA`

4. **执行工作流**
   - 节点会自动添加DNS记录
   - 等待DNS传播
   - 完成ACME挑战
   - 获取证书
   - 清理DNS记录

## 输出数据示例

```json
{
  "domain": "example.com",
  "email": "admin@example.com",
  "dnsProvider": "dnspod",
  "staging": true,
  "certificate": {
    "privateKey": "-----BEGIN PRIVATE KEY-----\n...",
    "certificate": "-----BEGIN CERTIFICATE-----\n...",
    "chain": "-----BEGIN CERTIFICATE-----\n...",
    "fullChain": "-----BEGIN CERTIFICATE-----\n...",
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validTo": "2024-04-01T00:00:00.000Z",
    "issuer": "Let's Encrypt Authority X3",
    "subject": "example.com",
    "serialNumber": "1234567890"
  }
}
```

## 注意事项

- 首次使用建议先在测试环境中验证
- 确保域名DNS解析正常
- 注意DNS提供商的API调用限制
- 证书有效期为90天，建议设置自动续期
