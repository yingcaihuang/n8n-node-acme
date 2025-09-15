import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { DnsProvider, DnsRecord } from '../types';

export class BaiduProvider implements DnsProvider {
  private api: AxiosInstance;
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;

  constructor(accessKeyId: string, secretAccessKey: string, region: string = 'bj') {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.api = axios.create({
      baseURL: 'https://dns.baidubce.com',
      headers: {
        'User-Agent': 'n8n-node-acme/1.2.0',
        'Content-Type': 'application/json',
      },
    });
  }

  private generateSignature(method: string, uri: string, params: Record<string, any> = {}, headers: Record<string, string> = {}): string {
    const timestamp = new Date().toISOString();
    const authStringPrefix = `bce-auth-v1/${this.accessKeyId}/${timestamp}/1800`;
    
    // 创建签名字符串
    const canonicalRequest = this.buildCanonicalRequest(method, uri, params, headers);
    const stringToSign = `${authStringPrefix}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
    
    // 生成签名
    const signature = crypto
      .createHmac('sha256', this.secretAccessKey)
      .update(stringToSign)
      .digest('hex');

    return `${authStringPrefix}/${signature}`;
  }

  private buildCanonicalRequest(method: string, uri: string, params: Record<string, any>, headers: Record<string, string>): string {
    const canonicalUri = uri;
    const canonicalQueryString = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n') + '\n';
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    const payloadHash = crypto.createHash('sha256').update('').digest('hex');
    
    return `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  }

  private async request(method: string, endpoint: string, data: any = null, params: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    const headers: Record<string, string> = {
      'Host': 'dns.baidubce.com',
      'x-bce-date': timestamp,
    };

    if (data) {
      headers['Content-Type'] = 'application/json';
    }

    const signature = this.generateSignature(method, endpoint, params, headers);
    headers['Authorization'] = signature;

    try {
      const response = await this.api.request({
        method,
        url: endpoint,
        data,
        params,
        headers,
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(`百度云DNS API错误: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  private extractDomain(domain: string): { domain: string; subdomain: string } {
    const parts = domain.split('.');
    if (parts.length >= 2) {
      return {
        domain: parts.slice(-2).join('.'),
        subdomain: parts.slice(0, -2).join('.'),
      };
    }
    return { domain, subdomain: '' };
  }

  async addTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 如果name是完整的域名，需要提取子域名
    let recordName = name;
    if (name.endsWith(`.${domain}`)) {
      recordName = name.substring(0, name.length - domain.length - 1);
    }
    
    // 如果是根域名记录，使用@
    if (recordName === domain) {
      recordName = '@';
    }

    // 确保记录名不包含域名后缀
    if (recordName.endsWith(`.${baseDomain}`)) {
      recordName = recordName.substring(0, recordName.length - baseDomain.length - 1);
    }

    await this.request('POST', `/v1/domain/${baseDomain}/record`, {
      rr: recordName || '@',
      type: 'TXT',
      value: value,
      ttl: 600,
    });
  }

  async removeTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 获取所有TXT记录
    const response = await this.request('GET', `/v1/domain/${baseDomain}/record`, null, {
      type: 'TXT',
    });

    // 查找匹配的记录
    const records = response.records || [];
    const recordToDelete = records.find((record: any) => 
      record.rr === name && record.value === value
    );

    if (recordToDelete) {
      await this.request('DELETE', `/v1/domain/${baseDomain}/record/${recordToDelete.id}`);
    }
  }

  async getDomainRecords(domain: string): Promise<DnsRecord[]> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    const response = await this.request('GET', `/v1/domain/${baseDomain}/record`);

    return (response.records || []).map((record: any) => ({
      name: record.rr,
      type: record.type,
      value: record.value,
      ttl: record.ttl,
    }));
  }

  // 获取域名列表的辅助方法
  static async getDomainList(accessKeyId: string, secretAccessKey: string, region: string = 'bj'): Promise<string[]> {
    const api = axios.create({
      baseURL: 'https://dns.baidubce.com',
      headers: {
        'User-Agent': 'n8n-node-acme/1.2.0',
        'Content-Type': 'application/json',
      },
    });

    try {
      const timestamp = new Date().toISOString();
      const headers: Record<string, string> = {
        'Host': 'dns.baidubce.com',
        'x-bce-date': timestamp,
      };

      const signature = crypto
        .createHmac('sha256', secretAccessKey)
        .update(`GET\n/v1/domain\n\nhost:dns.baidubce.com\nx-bce-date:${timestamp}\n\nhost;x-bce-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`)
        .digest('hex');

      headers['Authorization'] = `bce-auth-v1/${accessKeyId}/${timestamp}/1800/${signature}`;

      const response = await api.get('/v1/domain', { headers });
      
      return (response.data.domains || []).map((domain: any) => domain.domainName);
    } catch (error: any) {
      throw new Error(`获取百度云域名列表失败: ${error.message}`);
    }
  }
}
