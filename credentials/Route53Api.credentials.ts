import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Route53Api implements ICredentialType {
	name = 'route53Api';
	displayName = 'AWS Route 53 API';
	documentationUrl = 'https://docs.aws.amazon.com/Route53/latest/APIReference/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
			description: 'AWS Access Key ID with Route 53 permissions',
		},
		{
			displayName: 'Secret Access Key',
			name: 'secretAccessKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'AWS Secret Access Key',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'us-east-1',
					value: 'us-east-1',
				},
				{
					name: 'us-west-2',
					value: 'us-west-2',
				},
				{
					name: 'eu-west-1',
					value: 'eu-west-1',
				},
				{
					name: 'ap-southeast-1',
					value: 'ap-southeast-1',
				},
			],
			default: 'us-east-1',
			description: 'AWS Region for Route 53',
		},
		{
			displayName: 'Hosted Zone ID',
			name: 'hostedZoneId',
			type: 'string',
			default: '',
			required: true,
			description: 'Route 53 Hosted Zone ID for your domain',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'User-Agent': 'n8n-node-acme/1.1.0',
				'Content-Type': 'application/xml',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://route53.amazonaws.com/2013-04-01',
			url: '/hostedzone/{{$credentials.hostedZoneId}}',
			method: 'GET',
			headers: {
				'User-Agent': 'n8n-node-acme/1.1.0',
				'Content-Type': 'application/xml',
			},
		},
	};
}
