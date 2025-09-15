import axios, { AxiosInstance } from 'axios';
import { DnsProvider, DnsRecord } from '../types';

export class DnspodProvider implements DnsProvider {
  private api: AxiosInstance;
  private apiId: string;
  private apiToken: string;

  constructor(apiId: string, apiToken: string) {
    this.apiId = apiId;
    this.apiToken = apiToken;
    this.api = axios.create({
      baseURL: 'https://dnsapi.cn',
      headers: {
        'User-Agent': 'n8n-node-acme/1.0.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  private async request(action: string, data: Record<string, any> = {}) {
    const params = new URLSearchParams({
      login_token: `${this.apiId},${this.apiToken}`,
      format: 'json',
      ...data,
    });

    const response = await this.api.post(`/${action}`, params);
    
    if (response.data.status.code !== '1') {
      throw new Error(`Dnspod API Error: ${response.data.status.message}`);
    }
    
    return response.data;
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
    const { domain: baseDomain, subdomain } = this.extractDomain(domain);
    
    // 如果name是完整的域名，需要提取子域名
    let recordName = name;
    if (name.endsWith(`.${domain}`)) {
      recordName = name.substring(0, name.length - domain.length - 1);
    }
    
    // 如果是根域名记录，使用@
    if (recordName === domain) {
      recordName = '@';
    }

    await this.request('Record.Create', {
      domain: baseDomain,
      sub_domain: recordName || '@',
      record_type: 'TXT',
      record_line: '默认',
      value: value,
      ttl: 600,
    });
  }

  async removeTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 获取所有TXT记录
    const response = await this.request('Record.List', {
      domain: baseDomain,
      record_type: 'TXT',
    });

    // 查找匹配的记录
    const records = response.records || [];
    const recordToDelete = records.find((record: any) => 
      record.name === name && record.value === value
    );

    if (recordToDelete) {
      await this.request('Record.Remove', {
        domain: baseDomain,
        record_id: recordToDelete.id,
      });
    }
  }

  async getDomainRecords(domain: string): Promise<DnsRecord[]> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    const response = await this.request('Record.List', {
      domain: baseDomain,
    });

    return (response.records || []).map((record: any) => ({
      name: record.name,
      type: record.type,
      value: record.value,
      ttl: parseInt(record.ttl),
    }));
  }
}
