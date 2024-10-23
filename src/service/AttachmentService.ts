import { BACK_END } from '@/constant/domain';
import axios, { AxiosResponse } from 'axios';

export interface Attachment {
  id: number;
  name: string;
  type: string;
  data: Uint8Array;
}

class AttachmentService {
  private baseUrl: string = BACK_END+ '/attachment';

  public async uploadImage(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    try {
      const response: AxiosResponse<string[]> = await axios.post(`${this.baseUrl}/upload/post`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error('Image upload failed');
    }
  }

  public async getImage(name: string): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(`${this.baseUrl}/${name}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch image');
    }
  }

  public async getInfoByImageByName(name: string): Promise<Attachment> {
    try {
      const response: AxiosResponse<Attachment> = await axios.get(`${this.baseUrl}/info/${name}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch image info');
    }
  }

  public async test(): Promise<Attachment[]> {
    try {
      const response: AxiosResponse<Attachment[]> = await axios.get(`${this.baseUrl}/test`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch attachments');
    }
  }
}

export default new AttachmentService();