import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DnspodDnsApi implements ICredentialType {
	name = 'dnspodDnsApi';
	displayName = 'Dnspod DNS API';
	documentationUrl = 'https://docs.dnspod.cn/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'API ID',
			name: 'apiId',
			type: 'string',
			default: '',
			required: true,
			description: 'Dnspod API ID',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Dnspod API Token',
		},
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'options',
			options: [
				{
					name: 'Dnspod.cn (中国)',
					value: 'https://dnsapi.cn',
				},
				{
					name: 'Dnspod.com (国际)',
					value: 'https://dnsapi.com',
				},
			],
			default: 'https://dnsapi.cn',
			required: true,
			description: 'Dnspod API端点',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiEndpoint}}',
			url: '/User.Detail',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				login_token: '={{$credentials.apiId}},{{$credentials.apiToken}}',
				format: 'json',
			},
		},
	};
}


