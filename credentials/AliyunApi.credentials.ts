import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AliyunApi implements ICredentialType {
	name = 'aliyunApi';
	displayName = 'Aliyun API';
	documentationUrl = 'https://help.aliyun.com/document_detail/29739.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
			description: 'Aliyun Access Key ID',
		},
		{
			displayName: 'Access Key Secret',
			name: 'accessKeySecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Aliyun Access Key Secret',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'User-Agent': 'n8n-node-acme/1.0.0',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://alidns.aliyuncs.com',
			url: '/',
			method: 'GET',
			headers: {
				'User-Agent': 'n8n-node-acme/1.0.0',
			},
			qs: {
				Action: 'DescribeDomainRecords',
				DomainName: 'example.com',
				Version: '2015-01-09',
				Format: 'JSON',
				AccessKeyId: '={{$credentials.accessKeyId}}',
				SignatureMethod: 'HMAC-SHA1',
				SignatureVersion: '1.0',
				SignatureNonce: '1',
				Timestamp: '1',
				Signature: '1',
			},
		},
	};
}
