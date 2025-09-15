import acme from 'acme-client';
import crypto from 'crypto';
import { DnsProvider, CertificateResult, AcmeCertificateOptions } from '../types';

export class AcmeClient {
  private client: acme.Client;
  private dnsProvider: DnsProvider;
  private options: AcmeCertificateOptions;

  constructor(options: AcmeCertificateOptions, dnsProvider: DnsProvider) {
    this.options = options;
    this.dnsProvider = dnsProvider;
    
    // 创建ACME客户端
    const accountKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    
    this.client = new acme.Client({
      directoryUrl: options.staging 
        ? acme.directory.letsencrypt.staging 
        : acme.directory.letsencrypt.production,
      accountKey: accountKey,
    });
  }

  async createCertificate(): Promise<CertificateResult> {
    try {
      // 1. 创建账户
      const account = await this.client.createAccount({
        termsOfServiceAgreed: true,
        contact: [`mailto:${this.options.email}`],
      });

      // 2. 创建订单
      const order = await this.client.createOrder({
        identifiers: [
          { type: 'dns', value: this.options.domain },
        ],
      });

      // 3. 获取授权
      const authorizations = await this.client.getAuthorizations(order);

      // 4. 处理每个授权
      for (const authz of authorizations) {
        await this.handleAuthorization(authz);
      }

      // 5. 生成私钥和CSR
      let keyPair: crypto.KeyPairKeyObjectResult;
      
      if (this.options.keyType === 'EC') {
        const curveMap: Record<string, string> = {
          'P-256': 'prime256v1',
          'P-384': 'secp384r1',
          'P-521': 'secp521r1'
        };
        keyPair = crypto.generateKeyPairSync('ec', { 
          namedCurve: curveMap[this.options.ecCurve || 'P-256'] || 'prime256v1'
        });
      } else {
        keyPair = crypto.generateKeyPairSync('rsa', { 
          modulusLength: this.options.privateKeySize || 2048 
        });
      }
      
      const privateKeyPem = keyPair.privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
      
      // 创建CSR - 使用node-forge库
      const forge = require('node-forge');
      const pki = forge.pki;
      
      const keys = pki.privateKeyFromPem(privateKeyPem);
      const csr = pki.createCertificationRequest();
      csr.publicKey = keys.publicKey;
      csr.setSubject([{ name: 'commonName', value: this.options.domain }]);
      csr.sign(keys);
      
      const csrPem = pki.certificationRequestToPem(csr);

      // 6. 完成订单
      await this.client.finalizeOrder(order, csrPem);

      // 7. 获取证书
      const cert = await this.client.getCertificate(order);

      // 8. 解析证书信息
      const certInfo = this.parseCertificate(cert);

      return {
        privateKey: privateKeyPem,
        certificate: cert,
        chain: cert, // 简化处理，实际可能需要分离
        fullChain: cert,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        issuer: certInfo.issuer,
        subject: certInfo.subject,
        serialNumber: certInfo.serialNumber,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`ACME证书颁发失败: ${errorMessage}`);
    }
  }

  private async handleAuthorization(authz: acme.Authorization): Promise<void> {
    // 获取DNS-01挑战
    const challenge = authz.challenges.find(c => c.type === 'dns-01');
    if (!challenge) {
      throw new Error('未找到DNS-01挑战');
    }

    // 生成密钥授权
    const keyAuthorization = await this.client.getChallengeKeyAuthorization(challenge);

    // 计算DNS记录值
    const dnsRecordValue = crypto
      .createHash('sha256')
      .update(keyAuthorization)
      .digest('base64url');

    // 添加DNS记录
    const dnsRecordName = `_acme-challenge.${authz.identifier.value}`;
    
    try {
      await this.dnsProvider.addTxtRecord(authz.identifier.value, dnsRecordName, dnsRecordValue);

      // 等待DNS传播
      await this.waitForDnsPropagation(dnsRecordName, dnsRecordValue);

      // 验证挑战
      await this.client.completeChallenge(challenge);

      // 等待验证完成
      await this.client.waitForValidStatus(challenge);

    } finally {
      // 清理DNS记录
      try {
        await this.dnsProvider.removeTxtRecord(authz.identifier.value, dnsRecordName, dnsRecordValue);
      } catch (cleanupError) {
        const cleanupErrorMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        console.warn('DNS记录清理失败:', cleanupErrorMessage);
      }
    }
  }

  private async waitForDnsPropagation(recordName: string, recordValue: string, maxAttempts: number = 30): Promise<void> {
    const dns = require('dns');
    const { promisify } = require('util');
    const resolveTxt = promisify(dns.resolveTxt);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const records = await resolveTxt(recordName);
        const found = records.some((record: string[][]) => 
          record.some((part: string[]) => part.join('').includes(recordValue))
        );

        if (found) {
          // 额外等待确保传播完成
          await new Promise(resolve => setTimeout(resolve, 10000));
          return;
        }
      } catch (error) {
        // DNS记录可能还未传播，继续等待
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('DNS记录传播超时');
  }

  private parseCertificate(cert: string): {
    validFrom: Date;
    validTo: Date;
    issuer: string;
    subject: string;
    serialNumber: string;
  } {
    try {
      const forge = require('node-forge');
      const pki = forge.pki;
      
      // 解析PEM格式证书
      const certObj = pki.certificateFromPem(cert);
      
      return {
        validFrom: certObj.validity.notBefore,
        validTo: certObj.validity.notAfter,
        issuer: certObj.issuer.getField('CN')?.value || 'Unknown',
        subject: certObj.subject.getField('CN')?.value || 'Unknown',
        serialNumber: certObj.serialNumber,
      };
    } catch (error) {
      // 如果解析失败，返回默认值
      return {
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后
        issuer: 'Unknown',
        subject: this.options.domain,
        serialNumber: 'Unknown',
      };
    }
  }
}
