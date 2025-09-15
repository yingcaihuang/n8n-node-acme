import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { DnsProvider, DnsRecord } from '../types';

export class HuaweiProvider implements DnsProvider {
  private api: AxiosInstance;
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private projectId: string;

  constructor(accessKeyId: string, secretAccessKey: string, region: string, projectId: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.projectId = projectId;
    this.api = axios.create({
      baseURL: `https://dns.${region}.myhuaweicloud.com`,
      headers: {
        'User-Agent': 'n8n-node-acme/1.2.0',
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAuthToken(): Promise<string> {
    const authUrl = 'https://iam.myhuaweicloud.com/v3/auth/tokens';
    
    const authData = {
      auth: {
        identity: {
          methods: ['aksk'],
          aksk: {
            access: this.accessKeyId,
            secret: this.secretAccessKey,
          },
        },
        scope: {
          project: {
            id: this.projectId,
          },
        },
      },
    };

    try {
      const response = await axios.post(authUrl, authData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.headers['x-subject-token'];
    } catch (error: any) {
      throw new Error(`华为云认证失败: ${error.message}`);
    }
  }

  private async request(method: string, endpoint: string, data: any = null) {
    const token = await this.getAuthToken();
    
    try {
      const response = await this.api.request({
        method,
        url: endpoint,
        data,
        headers: {
          'X-Auth-Token': token,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(`华为云DNS API错误: ${JSON.stringify(error.response.data)}`);
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

    await this.request('POST', `/v2/zones/${baseDomain}/recordsets`, {
      name: recordName || baseDomain,
      type: 'TXT',
      records: [value],
      ttl: 600,
    });
  }

  async removeTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 获取所有TXT记录
    const response = await this.request('GET', `/v2/zones/${baseDomain}/recordsets?type=TXT`);

    // 查找匹配的记录
    const records = response.recordsets || [];
    const recordToDelete = records.find((record: any) => 
      record.name === name && record.records.includes(value)
    );

    if (recordToDelete) {
      await this.request('DELETE', `/v2/zones/${baseDomain}/recordsets/${recordToDelete.id}`);
    }
  }

  async getDomainRecords(domain: string): Promise<DnsRecord[]> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    const response = await this.request('GET', `/v2/zones/${baseDomain}/recordsets`);

    return (response.recordsets || []).map((record: any) => ({
      name: record.name,
      type: record.type,
      value: record.records[0] || '',
      ttl: record.ttl,
    }));
  }

  // 获取项目ID的辅助方法
  static async getProjectId(accessKeyId: string, secretAccessKey: string, region: string): Promise<string> {
    const authUrl = 'https://iam.myhuaweicloud.com/v3/auth/tokens';
    
    const authData = {
      auth: {
        identity: {
          methods: ['aksk'],
          aksk: {
            access: accessKeyId,
            secret: secretAccessKey,
          },
        },
        scope: {
          domain: {
            name: 'default',
          },
        },
      },
    };

    try {
      const response = await axios.post(authUrl, authData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const token = response.headers['x-subject-token'];
      
      // 获取项目列表
      const projectsResponse = await axios.get('https://iam.myhuaweicloud.com/v3/projects', {
        headers: {
          'X-Auth-Token': token,
        },
      });

      const projects = projectsResponse.data.projects || [];
      const project = projects.find((p: any) => p.name === region || p.name.includes(region));
      
      if (!project) {
        throw new Error(`未找到区域 ${region} 的项目`);
      }

      return project.id;
    } catch (error: any) {
      throw new Error(`获取华为云项目ID失败: ${error.message}`);
    }
  }
}
