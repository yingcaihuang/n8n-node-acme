import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { AcmeClient } from '../../core/AcmeClient';
import { DnspodProvider } from '../../providers/DnspodProvider';
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
				required: true,
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
				displayName: 'DNS Provider',
				name: 'dnsProvider',
				type: 'options',
				options: [
					{
						name: 'Dnspod',
						value: 'dnspod',
					},
				],
				default: 'dnspod',
				description: 'DNS provider for domain validation',
				required: true,
			},
			{
				displayName: 'Credential to Connect With',
				name: 'dnspodCredential',
				type: 'credentialsSelect',
				credentialTypes: ['dnspodApi'] as any,
				default: '',
				description: 'Dnspod API credentials',
				required: true,
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

				// 获取Dnspod凭据
				const credentials = await this.getCredentials('dnspodApi', i);
				if (!credentials?.apiId || !credentials?.apiToken) {
					throw new NodeOperationError(this.getNode(), 'Dnspod API凭据未配置');
				}
				const dnsProviderInstance = new DnspodProvider(credentials.apiId as string, credentials.apiToken as string);

				// 创建ACME客户端选项
				const options: AcmeCertificateOptions = {
					domain,
					email,
					dnsProvider: 'dnspod',
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
