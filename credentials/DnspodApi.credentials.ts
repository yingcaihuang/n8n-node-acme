import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DnspodApi implements ICredentialType {
	name = 'dnspodApi';
	displayName = 'Dnspod API';
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
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Dnspod API Token',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'User-Agent': 'n8n-node-acme/1.0.0',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://dnsapi.cn',
			url: '/User.Detail',
			method: 'POST',
			headers: {
				'User-Agent': 'n8n-node-acme/1.0.0',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'login_email={{$credentials.email}}&login_password={{$credentials.password}}&format=json',
		},
	};
}
