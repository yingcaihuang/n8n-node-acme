import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface AliyunDnsCredentials {
	accessKeyId: string;
	accessKeySecret: string;
	region: string;
}

export class AliyunDnsProvider {
	private client: AxiosInstance;
	private credentials: AliyunDnsCredentials;

	constructor(credentials: AliyunDnsCredentials) {
		this.credentials = credentials;
		this.client = axios.create({
			baseURL: 'https://alidns.aliyuncs.com',
			timeout: 30000,
		});
	}

	/**
	 * 生成阿里云API签名
	 */
	private generateSignature(params: Record<string, any>, method: string = 'GET'): string {
		// 添加公共参数
		const commonParams = {
			Format: 'JSON',
			Version: '2015-01-09',
			AccessKeyId: this.credentials.accessKeyId,
			SignatureMethod: 'HMAC-SHA1',
			Timestamp: new Date().toISOString(),
			SignatureVersion: '1.0',
			SignatureNonce: Math.random().toString(36).substr(2, 15),
		};

		// 合并参数
		const allParams: Record<string, any> = { ...commonParams, ...params };

		// 排序参数
		const sortedKeys = Object.keys(allParams).sort();
		const queryString = sortedKeys
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
			.join('&');

		// 构造签名字符串
		const stringToSign = `${method}&${encodeURIComponent('/')}&${encodeURIComponent(queryString)}`;

		// 生成签名
		const signature = crypto
			.createHmac('sha1', `${this.credentials.accessKeySecret}&`)
			.update(stringToSign)
			.digest('base64');

		return signature;
	}

	/**
	 * 添加DNS记录
	 */
	async addTxtRecord(domain: string, name: string, value: string): Promise<string> {
		const params = {
			Action: 'AddDomainRecord',
			DomainName: domain,
			RR: name,
			Type: 'TXT',
			Value: value,
		};

		const signature = this.generateSignature(params);
		const queryParams = {
			...params,
			Signature: signature,
		};

		try {
			const response = await this.client.get('/', { params: queryParams });
			
			if (response.data.Code !== 'DomainRecordAdded') {
				throw new Error(`阿里云API错误: ${response.data.Message || '未知错误'}`);
			}

			return response.data.RecordId;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`添加DNS记录失败: ${error.response?.data?.Message || error.message}`);
			}
			throw error;
		}
	}

	/**
	 * 删除DNS记录
	 */
	async removeTxtRecord(domain: string, recordId: string): Promise<void> {
		const params = {
			Action: 'DeleteDomainRecord',
			RecordId: recordId,
		};

		const signature = this.generateSignature(params);
		const queryParams = {
			...params,
			Signature: signature,
		};

		try {
			const response = await this.client.get('/', { params: queryParams });
			
			if (response.data.Code !== 'DomainRecordDeleted') {
				throw new Error(`阿里云API错误: ${response.data.Message || '未知错误'}`);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`删除DNS记录失败: ${error.response?.data?.Message || error.message}`);
			}
			throw error;
		}
	}

	/**
	 * 获取域名记录列表
	 */
	async getDomainRecords(domain: string, type: string = 'TXT'): Promise<any[]> {
		const params = {
			Action: 'DescribeDomainRecords',
			DomainName: domain,
			Type: type,
		};

		const signature = this.generateSignature(params);
		const queryParams = {
			...params,
			Signature: signature,
		};

		try {
			const response = await this.client.get('/', { params: queryParams });
			
			if (response.data.Code !== 'DomainRecords') {
				throw new Error(`阿里云API错误: ${response.data.Message || '未知错误'}`);
			}

			return response.data.DomainRecords?.Record || [];
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`获取DNS记录失败: ${error.response?.data?.Message || error.message}`);
			}
			throw error;
		}
	}

	/**
	 * 等待DNS传播
	 */
	async waitForDnsPropagation(domain: string, name: string, value: string, timeout: number = 300000): Promise<void> {
		const startTime = Date.now();
		const checkInterval = 5000; // 5秒检查一次

		while (Date.now() - startTime < timeout) {
			try {
				const records = await this.getDomainRecords(domain, 'TXT');
				const targetRecord = records.find((record: any) => 
					record.RR === name && record.Value === value
				);

				if (targetRecord) {
					// 等待额外时间确保DNS传播
					await new Promise(resolve => setTimeout(resolve, 10000));
					return;
				}
			} catch (error) {
				// 忽略检查错误，继续等待
			}

			await new Promise(resolve => setTimeout(resolve, checkInterval));
		}

		throw new Error('DNS传播超时');
	}
}

