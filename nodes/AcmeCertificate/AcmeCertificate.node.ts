import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { AcmeClient } from '../../core/AcmeClient';
import { DnspodProvider } from '../../providers/DnspodProvider';
import { AliyunProvider } from '../../providers/AliyunProvider';
import { CloudflareProvider } from '../../providers/CloudflareProvider';
import { Route53Provider } from '../../providers/Route53Provider';
import { AcmeCertificateOptions } from '../../types';

export class AcmeCertificate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ACME Certificate',
		name: 'acmeCertificate',
		icon: 'file:certificate.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Issue SSL/TLS certificates using ACME protocol',
		defaults: {
			name: 'ACME Certificate',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		credentials: [
			{
				name: 'dnspodApi',
				required: false,
			},
			{
				name: 'aliyunApi',
				required: false,
			},
			{
				name: 'cloudflareApi',
				required: false,
			},
			{
				name: 'route53Api',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Issue Certificate',
						value: 'issue',
						description: 'Issue a new SSL/TLS certificate',
						action: 'Issue a certificate',
					},
				],
				default: 'issue',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'example.com',
				description: 'The domain name for the certificate',
				required: true,
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'admin@example.com',
				description: 'Email address for ACME account registration',
				required: true,
			},
			{
				displayName: 'DNS Provider',
				name: 'dnsProvider',
				type: 'options',
				options: [
					{
						name: 'Dnspod',
						value: 'dnspod',
					},
					{
						name: 'Aliyun',
						value: 'aliyun',
					},
					{
						name: 'Cloudflare',
						value: 'cloudflare',
					},
					{
						name: 'AWS Route 53',
						value: 'route53',
					},
				],
				default: 'dnspod',
				description: 'DNS provider for domain validation',
				required: true,
			},
			{
				displayName: 'Use Staging Environment',
				name: 'staging',
				type: 'boolean',
				default: true,
				description: 'Whether to use Let\'s Encrypt staging environment for testing',
			},
			{
				displayName: 'Private Key Size',
				name: 'privateKeySize',
				type: 'options',
				options: [
					{
						name: '2048 Bits',
						value: 2048,
					},
					{
						name: '4096 Bits',
						value: 4096,
					},
				],
				default: 2048,
				description: 'Size of the private key in bits',
			},
			{
				displayName: 'Key Type',
				name: 'keyType',
				type: 'options',
				options: [
					{
						name: 'RSA',
						value: 'RSA',
					},
					{
						name: 'ECDSA',
						value: 'EC',
					},
				],
				default: 'RSA',
				description: 'Type of cryptographic key',
			},
			{
				displayName: 'EC Curve',
				name: 'ecCurve',
				type: 'options',
				options: [
					{
						name: 'P-256',
						value: 'P-256',
					},
					{
						name: 'P-384',
						value: 'P-384',
					},
					{
						name: 'P-521',
						value: 'P-521',
					},
				],
				default: 'P-256',
				description: 'Elliptic curve for ECDSA keys',
				displayOptions: {
					show: {
						keyType: ['EC'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const domain = this.getNodeParameter('domain', i) as string;
				const email = this.getNodeParameter('email', i) as string;
				const dnsProvider = this.getNodeParameter('dnsProvider', i) as string;
				const staging = this.getNodeParameter('staging', i) as boolean;
				const privateKeySize = this.getNodeParameter('privateKeySize', i) as number;
				const keyType = this.getNodeParameter('keyType', i) as string;
				const ecCurve = this.getNodeParameter('ecCurve', i) as string;

				// 验证DNS提供商凭据
				let dnsProviderInstance;
				if (dnsProvider === 'dnspod') {
					const credentials = await this.getCredentials('dnspodApi');
					if (!credentials?.apiId || !credentials?.apiToken) {
						throw new NodeOperationError(this.getNode(), 'Dnspod API凭据未配置');
					}
					dnsProviderInstance = new DnspodProvider(credentials.apiId as string, credentials.apiToken as string);
				} else if (dnsProvider === 'aliyun') {
					const credentials = await this.getCredentials('aliyunApi');
					if (!credentials?.accessKeyId || !credentials?.accessKeySecret) {
						throw new NodeOperationError(this.getNode(), '阿里云API凭据未配置');
					}
					dnsProviderInstance = new AliyunProvider(credentials.accessKeyId as string, credentials.accessKeySecret as string);
				} else if (dnsProvider === 'cloudflare') {
					const credentials = await this.getCredentials('cloudflareApi');
					if (!credentials?.apiToken || !credentials?.zoneId) {
						throw new NodeOperationError(this.getNode(), 'Cloudflare API凭据未配置');
					}
					dnsProviderInstance = new CloudflareProvider(credentials.apiToken as string, credentials.zoneId as string);
				} else if (dnsProvider === 'route53') {
					const credentials = await this.getCredentials('route53Api');
					if (!credentials?.accessKeyId || !credentials?.secretAccessKey || !credentials?.hostedZoneId) {
						throw new NodeOperationError(this.getNode(), 'AWS Route 53 API凭据未配置');
					}
					dnsProviderInstance = new Route53Provider(
						credentials.accessKeyId as string,
						credentials.secretAccessKey as string,
						credentials.region as string || 'us-east-1',
						credentials.hostedZoneId as string
					);
				} else {
					throw new NodeOperationError(this.getNode(), `不支持的DNS提供商: ${dnsProvider}`);
				}

				// 创建ACME客户端选项
				const options: AcmeCertificateOptions = {
					domain,
					email,
					dnsProvider: dnsProvider as 'dnspod' | 'aliyun' | 'cloudflare' | 'route53',
					staging,
					privateKeySize: privateKeySize as 2048 | 4096,
					keyType: keyType as 'RSA' | 'EC',
					ecCurve: ecCurve as 'P-256' | 'P-384' | 'P-521',
				};

				// 创建ACME客户端并颁发证书
				const acmeClient = new AcmeClient(options, dnsProviderInstance);
				const certificate = await acmeClient.createCertificate();

				returnData.push({
					json: {
						domain,
						email,
						dnsProvider,
						staging,
						certificate: {
							privateKey: certificate.privateKey,
							certificate: certificate.certificate,
							chain: certificate.chain,
							fullChain: certificate.fullChain,
							validFrom: certificate.validFrom.toISOString(),
							validTo: certificate.validTo.toISOString(),
							issuer: certificate.issuer,
							subject: certificate.subject,
							serialNumber: certificate.serialNumber,
						},
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({
						json: {
							error: errorMessage,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
