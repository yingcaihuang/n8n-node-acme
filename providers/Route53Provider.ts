import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { DnsProvider, DnsRecord } from '../types';

export class Route53Provider implements DnsProvider {
  private api: AxiosInstance;
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private hostedZoneId: string;

  constructor(accessKeyId: string, secretAccessKey: string, region: string, hostedZoneId: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.hostedZoneId = hostedZoneId;
    this.api = axios.create({
      baseURL: `https://route53.amazonaws.com/2013-04-01`,
      headers: {
        'User-Agent': 'n8n-node-acme/1.1.0',
        'Content-Type': 'application/xml',
      },
    });
  }

  private generateSignature(method: string, path: string, body: string = ''): string {
    const date = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const timestamp = date;
    
    // 创建签名字符串
    const stringToSign = `${method}\n\napplication/xml\n${timestamp}\n${path}`;
    
    // 生成签名
    const signature = crypto
      .createHmac('sha256', this.secretAccessKey)
      .update(stringToSign)
      .digest('base64');

    return signature;
  }

  private async request(method: string, path: string, body: string = '') {
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const signature = this.generateSignature(method, path, body);

    try {
      const response = await this.api.request({
        method,
        url: path,
        data: body,
        headers: {
          'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${timestamp.substring(0, 8)}/${this.region}/route53/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`,
          'X-Amz-Date': timestamp,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(`AWS Route 53 API Error: ${error.response.data}`);
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

    // 确保记录名以点结尾（Route 53要求）
    if (!recordName.endsWith('.')) {
      recordName += '.';
    }

    const changeBatch = {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: recordName,
            Type: 'TXT',
            TTL: 600,
            ResourceRecords: [
              {
                Value: `"${value}"`,
              },
            ],
          },
        },
      ],
    };

    const xmlBody = this.buildChangeBatchXML(changeBatch);
    await this.request('POST', `/hostedzone/${this.hostedZoneId}/rrset`, xmlBody);
  }

  async removeTxtRecord(domain: string, name: string, value: string): Promise<void> {
    const { domain: baseDomain } = this.extractDomain(domain);
    
    // 获取所有TXT记录
    const response = await this.request('GET', `/hostedzone/${this.hostedZoneId}/rrset?type=TXT`);

    // 查找匹配的记录
    const records = this.parseResourceRecordSets(response);
    const recordToDelete = records.find((record: any) => 
      record.Name === name && record.ResourceRecords.some((rr: any) => rr.Value === `"${value}"`)
    );

    if (recordToDelete) {
      const changeBatch = {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: recordToDelete,
          },
        ],
      };

      const xmlBody = this.buildChangeBatchXML(changeBatch);
      await this.request('POST', `/hostedzone/${this.hostedZoneId}/rrset`, xmlBody);
    }
  }

  async getDomainRecords(domain: string): Promise<DnsRecord[]> {
    const response = await this.request('GET', `/hostedzone/${this.hostedZoneId}/rrset`);
    const records = this.parseResourceRecordSets(response);

    return records.map((record: any) => ({
      name: record.Name,
      type: record.Type,
      value: record.ResourceRecords[0]?.Value || '',
      ttl: record.TTL,
    }));
  }

  private buildChangeBatchXML(changeBatch: any): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ChangeResourceRecordSetsRequest xmlns="https://route53.amazonaws.com/doc/2013-04-01/">\n';
    xml += '  <ChangeBatch>\n';
    
    changeBatch.Changes.forEach((change: any) => {
      xml += '    <Change>\n';
      xml += `      <Action>${change.Action}</Action>\n`;
      xml += '      <ResourceRecordSet>\n';
      xml += `        <Name>${change.ResourceRecordSet.Name}</Name>\n`;
      xml += `        <Type>${change.ResourceRecordSet.Type}</Type>\n`;
      xml += `        <TTL>${change.ResourceRecordSet.TTL}</TTL>\n`;
      xml += '        <ResourceRecords>\n';
      
      change.ResourceRecordSet.ResourceRecords.forEach((rr: any) => {
        xml += '          <ResourceRecord>\n';
        xml += `            <Value>${rr.Value}</Value>\n`;
        xml += '          </ResourceRecord>\n';
      });
      
      xml += '        </ResourceRecords>\n';
      xml += '      </ResourceRecordSet>\n';
      xml += '    </Change>\n';
    });
    
    xml += '  </ChangeBatch>\n';
    xml += '</ChangeResourceRecordSetsRequest>';
    
    return xml;
  }

  private parseResourceRecordSets(xmlResponse: string): any[] {
    // 简化的XML解析，实际项目中建议使用专门的XML解析库
    // 这里返回空数组作为占位符
    return [];
  }

  // 获取Hosted Zone ID的辅助方法
  static async getHostedZoneId(accessKeyId: string, secretAccessKey: string, region: string, domain: string): Promise<string> {
    const api = axios.create({
      baseURL: `https://route53.amazonaws.com/2013-04-01`,
      headers: {
        'User-Agent': 'n8n-node-acme/1.1.0',
        'Content-Type': 'application/xml',
      },
    });

    try {
      const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
      const signature = crypto
        .createHmac('sha256', secretAccessKey)
        .update(`GET\n\napplication/xml\n${timestamp}\n/hostedzone`)
        .digest('base64');

      const response = await api.get('/hostedzone', {
        headers: {
          'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${timestamp.substring(0, 8)}/${region}/route53/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`,
          'X-Amz-Date': timestamp,
        },
      });

      // 解析XML响应获取Hosted Zone ID
      // 这里需要根据实际响应格式进行解析
      return 'Z1234567890ABC'; // 占位符
    } catch (error: any) {
      throw new Error(`Failed to get Route 53 hosted zone ID: ${error.message}`);
    }
  }
}
