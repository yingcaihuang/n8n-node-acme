# 更新日志

所有重要的项目更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且此项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.1] - 2024-01-01

### 修复
- 修复TypeScript类型错误
- 修复ESLint配置问题
- 优化构建流程

## [1.0.0] - 2024-01-01

### 新增
- 初始版本发布
- 支持ACME证书自动颁发
- 支持DNS-01挑战验证
- 支持Dnspod DNS服务商
- 支持阿里云DNS服务商
- 支持Let's Encrypt测试和生产环境
- 支持RSA和ECDSA密钥类型
- 支持2048和4096位私钥长度
- 返回完整的证书信息（私钥、证书、链、有效期等）
- 自动DNS记录清理
- DNS传播等待机制
- 错误处理和重试机制

### 功能
- ACME客户端集成
- DNS记录自动添加和删除
- 证书解析和信息提取
- n8n节点接口实现
- TypeScript类型定义
- 凭据管理（Dnspod和阿里云API）

### 技术特性
- 基于acme-client库
- 支持异步操作
- 完整的错误处理
- 模块化设计
- 类型安全
