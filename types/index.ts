export interface AcmeCertificateCredentials {
  dnspodApi?: {
    apiId: string;
    apiToken: string;
  };
  aliyunApi?: {
    accessKeyId: string;
    accessKeySecret: string;
  };
  cloudflareApi?: {
    apiToken: string;
    zoneId: string;
  };
  route53Api?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    hostedZoneId: string;
  };
  baiduApi?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  huaweiApi?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    projectId: string;
  };
}

export interface AcmeCertificateOptions {
  domain: string;
  email: string;
  dnsProvider: 'dnspod' | 'aliyun' | 'cloudflare' | 'route53' | 'baidu' | 'huawei';
  staging?: boolean;
  privateKeySize?: 2048 | 4096;
  keyType?: 'RSA' | 'EC';
  ecCurve?: 'P-256' | 'P-384' | 'P-521';
}

export interface DnsRecord {
  name: string;
  type: string;
  value: string;
  ttl?: number;
}

export interface DnsProvider {
  addTxtRecord(domain: string, name: string, value: string): Promise<string | void>;
  removeTxtRecord(domain: string, recordId: string): Promise<void>;
  waitForDnsPropagation(domain: string, name: string, value: string, timeout?: number): Promise<void>;
}

export interface CertificateResult {
  privateKey: string;
  certificate: string;
  chain?: string;
  fullChain?: string;
  validFrom: Date;
  validTo: Date;
  issuer: string;
  subject: string;
  serialNumber: string;
}

export interface AcmeChallenge {
  type: string;
  url: string;
  token: string;
  keyAuthorization: string;
  status: string;
}

export interface AcmeOrder {
  status: string;
  expires: string;
  identifiers: Array<{
    type: string;
    value: string;
  }>;
  authorizations: string[];
  finalize: string;
  certificate?: string;
}
