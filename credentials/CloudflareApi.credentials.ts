import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CloudflareApi implements ICredentialType {
	name = 'cloudflareApi';
	displayName = 'Cloudflare API';
	documentationUrl = 'https://developers.cloudflare.com/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Cloudflare API Token with Zone:Read and DNS:Edit permissions',
		},
		{
			displayName: 'Zone ID',
			name: 'zoneId',
			type: 'string',
			default: '',
			required: true,
			description: 'Cloudflare Zone ID for your domain',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.apiToken}}',
				'Content-Type': 'application/json',
				'User-Agent': 'n8n-node-acme/1.1.0',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.cloudflare.com/client/v4',
			url: '/zones/{{$credentials.zoneId}}',
			method: 'GET',
			headers: {
				'Authorization': '=Bearer {{$credentials.apiToken}}',
				'Content-Type': 'application/json',
				'User-Agent': 'n8n-node-acme/1.1.0',
			},
		},
	};
}
