import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BaiduApi implements ICredentialType {
	name = 'baiduApi';
	displayName = '百度云 API';
	documentationUrl = 'https://cloud.baidu.com/doc/DNS/index.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
			description: '百度云Access Key ID',
		},
		{
			displayName: 'Secret Access Key',
			name: 'secretAccessKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: '百度云Secret Access Key',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: '北京 (Bj)',
					value: 'bj',
				},
				{
					name: '广州 (Gz)',
					value: 'gz',
				},
				{
					name: '苏州 (Su)',
					value: 'su',
				},
			],
			default: 'bj',
			description: '百度云区域',
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
			baseURL: 'https://dns.baidubce.com',
			url: '/v1/domain',
			method: 'GET',
			headers: {
				'User-Agent': 'n8n-node-acme/1.2.0',
				'Content-Type': 'application/json',
			},
		},
	};
}
