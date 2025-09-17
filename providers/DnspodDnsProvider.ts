import axios, { AxiosInstance } from 'axios';

export interface DnspodDnsCredentials {
	apiId: string;
	apiToken: string;
	apiEndpoint: string;
}

export class DnspodDnsProvider {
	private client: AxiosInstance;
	private credentials: DnspodDnsCredentials;

	constructor(credentials: DnspodDnsCredentials) {
		this.credentials = credentials;
		this.client = axios.create({
			baseURL: credentials.apiEndpoint,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
	}

	/**
	 * 获取登录令牌
	 */
	private getLoginToken(): string {
		return `${this.credentials.apiId},${this.credentials.apiToken}`;
	}

	/**
	 * 添加DNS记录
	 */
	async addTxtRecord(domain: string, name: string, value: string): Promise<string> {
		const data = {
			login_token: this.getLoginToken(),
			format: 'json',
			domain: domain,
			sub_domain: name,
			record_type: 'TXT',
			record_line: '默认',
			value: value,
		};

		try {
			const response = await this.client.post('/Record.Create', data);
			
			if (response.data.status?.code !== '1') {
				throw new Error(`Dnspod API错误: ${response.data.status?.message || '未知错误'}`);
			}

			return response.data.record?.id;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`添加DNS记录失败: ${error.response?.data?.status?.message || error.message}`);
			}
			throw error;
		}
	}

	/**
	 * 删除DNS记录
	 */
	async removeTxtRecord(domain: string, recordId: string): Promise<void> {
		const data = {
			login_token: this.getLoginToken(),
			format: 'json',
			domain: domain,
			record_id: recordId,
		};

		try {
			const response = await this.client.post('/Record.Remove', data);
			
			if (response.data.status?.code !== '1') {
				throw new Error(`Dnspod API错误: ${response.data.status?.message || '未知错误'}`);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`删除DNS记录失败: ${error.response?.data?.status?.message || error.message}`);
			}
			throw error;
		}
	}

	/**
	 * 获取域名记录列表
	 */
	async getDomainRecords(domain: string, type: string = 'TXT'): Promise<any[]> {
		const data = {
			login_token: this.getLoginToken(),
			format: 'json',
			domain: domain,
			record_type: type,
		};

		try {
			const response = await this.client.post('/Record.List', data);
			
			if (response.data.status?.code !== '1') {
				throw new Error(`Dnspod API错误: ${response.data.status?.message || '未知错误'}`);
			}

			return response.data.records || [];
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`获取DNS记录失败: ${error.response?.data?.status?.message || error.message}`);
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
					record.name === name && record.value === value
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

