import axios, { AxiosInstance } from 'axios';
import { DnsProvider, DnsRecord } from '../types';

export class CloudflareProvider implements DnsProvider {
  private api: AxiosInstance;
  private apiToken: string;
  private zoneId: string;

  constructor(apiToken: string, zoneId: string) {
    this.apiToken = apiToken;
    this.zoneId = zoneId;
    this.api = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-node-acme/1.1.0',
      },
    });
  }

  private async request(method: string, endpoint: string, data: any = null) {
    try {
      const response = await this.api.request({
        method,
        url: endpoint,
        data,
      });

      if (!response.data.success) {
        const errors = response.data.errors || [];
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        throw new Error(`Cloudflare API Error: ${errorMessages}`);
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = errors.map((err: any) => err.message).join(', ');
        throw new Error(`Cloudflare API Error: ${errorMessages}`);
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

    await this.request('POST', `/zones/${this.zoneId}/dns_records`, {
      type: 'TXT',
      name: recordName || baseDomain,
      content: value,
      ttl: 600,
    });
  }

  async removeTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 获取所有TXT记录
    const response = await this.request('GET', `/zones/${this.zoneId}/dns_records?type=TXT`);

    // 查找匹配的记录
    const records = response.result || [];
    const recordToDelete = records.find((record: any) => 
      record.name === name && record.content === value
    );

    if (recordToDelete) {
      await this.request('DELETE', `/zones/${this.zoneId}/dns_records/${recordToDelete.id}`);
    }
  }

  async getDomainRecords(domain: string): Promise<DnsRecord[]> {
    const response = await this.request('GET', `/zones/${this.zoneId}/dns_records`);

    return (response.result || []).map((record: any) => ({
      name: record.name,
      type: record.type,
      value: record.content,
      ttl: record.ttl,
    }));
  }

  // 获取Zone ID的辅助方法
  static async getZoneId(apiToken: string, domain: string): Promise<string> {
    const api = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-node-acme/1.1.0',
      },
    });

    try {
      const response = await api.get(`/zones?name=${domain}`);
      
      if (!response.data.success) {
        throw new Error('Failed to get zone information');
      }

      const zones = response.data.result || [];
      if (zones.length === 0) {
        throw new Error(`No zone found for domain: ${domain}`);
      }

      return zones[0].id;
    } catch (error: any) {
      throw new Error(`Failed to get Cloudflare zone ID: ${error.message}`);
    }
  }
}
