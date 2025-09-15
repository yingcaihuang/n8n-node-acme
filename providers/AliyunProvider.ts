import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { DnsProvider, DnsRecord } from '../types';

export class AliyunProvider implements DnsProvider {
  private api: AxiosInstance;
  private accessKeyId: string;
  private accessKeySecret: string;

  constructor(accessKeyId: string, accessKeySecret: string) {
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;
    this.api = axios.create({
      baseURL: 'https://alidns.aliyuncs.com',
      headers: {
        'User-Agent': 'n8n-node-acme/1.0.0',
      },
    });
  }

  private generateSignature(params: Record<string, any>, method: string = 'GET'): string {
    // 排序参数
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const stringToSign = `${method}&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;
    
    return crypto
      .createHmac('sha1', `${this.accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');
  }

  private async request(action: string, params: Record<string, any> = {}) {
    const commonParams = {
      Action: action,
      Version: '2015-01-09',
      Format: 'JSON',
      AccessKeyId: this.accessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(),
      Timestamp: new Date().toISOString(),
    };

    const allParams = { ...commonParams, ...params } as any;
    allParams.Signature = this.generateSignature(allParams);

    const response = await this.api.get('/', { params: allParams });
    
    if (response.data.Code) {
      throw new Error(`Aliyun API Error: ${response.data.Message}`);
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

    await this.request('AddDomainRecord', {
      DomainName: baseDomain,
      RR: recordName || '@',
      Type: 'TXT',
      Value: value,
      TTL: 600,
    });
  }

  async removeTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 获取所有TXT记录
    const response = await this.request('DescribeDomainRecords', {
      DomainName: baseDomain,
      Type: 'TXT',
    });

    // 查找匹配的记录
    const records = response.DomainRecords?.Record || [];
    const recordToDelete = records.find((record: any) => 
      record.RR === name && record.Value === value
    );

    if (recordToDelete) {
      await this.request('DeleteDomainRecord', {
        RecordId: recordToDelete.RecordId,
      });
    }
  }

  async getDomainRecords(domain: string): Promise<DnsRecord[]> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    const response = await this.request('DescribeDomainRecords', {
      DomainName: baseDomain,
    });

    return (response.DomainRecords?.Record || []).map((record: any) => ({
      name: record.RR,
      type: record.Type,
      value: record.Value,
      ttl: parseInt(record.TTL),
    }));
  }
}
