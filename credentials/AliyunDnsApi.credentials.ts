import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AliyunDnsApi implements ICredentialType {
	name = 'aliyunDnsApi';
	displayName = 'Aliyun DNS API';
	documentationUrl = 'https://help.aliyun.com/document_detail/29739.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
			description: '阿里云Access Key ID',
		},
		{
			displayName: 'Access Key Secret',
			name: 'accessKeySecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: '阿里云Access Key Secret',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: '华北1（青岛）',
					value: 'cn-qingdao',
				},
				{
					name: '华北2（北京）',
					value: 'cn-beijing',
				},
				{
					name: '华北3（张家口）',
					value: 'cn-zhangjiakou',
				},
				{
					name: '华北5（呼和浩特）',
					value: 'cn-huhehaote',
				},
				{
					name: '华东1（杭州）',
					value: 'cn-hangzhou',
				},
				{
					name: '华东2（上海）',
					value: 'cn-shanghai',
				},
				{
					name: '华南1（深圳）',
					value: 'cn-shenzhen',
				},
				{
					name: '华南2（河源）',
					value: 'cn-heyuan',
				},
				{
					name: '华南3（广州）',
					value: 'cn-guangzhou',
				},
				{
					name: '美国（弗吉尼亚）',
					value: 'us-east-1',
				},
				{
					name: '美国（硅谷）',
					value: 'us-west-1',
				},
				{
					name: '欧洲西部1（英国）',
					value: 'eu-west-1',
				},
				{
					name: '欧洲中部1（法兰克福）',
					value: 'eu-central-1',
				},
				{
					name: '西南1（成都）',
					value: 'cn-chengdu',
				},
				{
					name: '亚太东北1（日本）',
					value: 'ap-northeast-1',
				},
				{
					name: '亚太东北2（首尔）',
					value: 'ap-northeast-2',
				},
				{
					name: '亚太东南1（新加坡）',
					value: 'ap-southeast-1',
				},
				{
					name: '亚太东南2（悉尼）',
					value: 'ap-southeast-2',
				},
				{
					name: '亚太东南3（吉隆坡）',
					value: 'ap-southeast-3',
				},
				{
					name: '亚太东南5（雅加达）',
					value: 'ap-southeast-5',
				},
				{
					name: '亚太东南6（马尼拉）',
					value: 'ap-southeast-6',
				},
				{
					name: '亚太东南7（曼谷）',
					value: 'ap-southeast-7',
				},
				{
					name: '亚太南部1（孟买）',
					value: 'ap-south-1',
				},
				{
					name: '中东东部1（迪拜）',
					value: 'me-east-1',
				},
				{
					name: '中国（香港）',
					value: 'cn-hongkong',
				},
			],
			default: 'cn-hangzhou',
			required: true,
			description: '阿里云区域',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://alidns.aliyuncs.com',
			url: '/',
			method: 'GET',
			qs: {
				Action: 'DescribeDomains',
				Version: '2015-01-09',
				AccessKeyId: '={{$credentials.accessKeyId}}',
				SignatureMethod: 'HMAC-SHA1',
				Timestamp: '={{new Date().toISOString()}}',
				SignatureVersion: '1.0',
				SignatureNonce: '={{Math.random().toString(36).substr(2, 15)}}',
				Format: 'JSON',
			},
		},
	};
}


