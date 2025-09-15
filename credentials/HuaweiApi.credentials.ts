import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HuaweiApi implements ICredentialType {
	name = 'huaweiApi';
	displayName = '华为云 API';
	documentationUrl = 'https://support.huaweicloud.com/api-dns/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
			description: '华为云Access Key ID',
		},
		{
			displayName: 'Secret Access Key',
			name: 'secretAccessKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: '华为云Secret Access Key',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: '华北-北京一 (Cn-North-1)',
					value: 'cn-north-1',
				},
				{
					name: '华北-北京四 (Cn-North-4)',
					value: 'cn-north-4',
				},
				{
					name: '华东-上海一 (Cn-East-3)',
					value: 'cn-east-3',
				},
				{
					name: '华南-广州 (Cn-South-1)',
					value: 'cn-south-1',
				},
			],
			default: 'cn-north-1',
			description: '华为云区域',
		},
		{
			displayName: 'Project ID',
			name: 'projectId',
			type: 'string',
			default: '',
			required: true,
			description: '华为云项目ID',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'User-Agent': 'n8n-node-acme/1.2.0',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://iam.myhuaweicloud.com',
			url: '/v3/auth/tokens',
			method: 'POST',
			headers: {
				'User-Agent': 'n8n-node-acme/1.2.0',
				'Content-Type': 'application/json',
			},
			body: {
				auth: {
					identity: {
						methods: ['aksk'],
						aksk: {
							access: '={{$credentials.accessKeyId}}',
							secret: '={{$credentials.secretAccessKey}}',
						},
					},
					scope: {
						project: {
							id: '={{$credentials.projectId}}',
						},
					},
				},
			},
		},
	};
}
