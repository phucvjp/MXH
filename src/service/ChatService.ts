import { BACK_END } from '@/constant/domain';
import axios, { AxiosResponse } from 'axios';
import { User } from './UserService';
import { Attachment } from './AttachmentService';

export interface MessageModel {
  senderId: number;
  content: string;
  status: string;
}

export interface Message {
  messageId: number;
  content: string;
  sendAt: string;
  updateAt: string;
  user: User;
  status: string;
  attachments: Attachment[];
  groupId: number;
}

class ChatService {
  private baseUrl: string = BACK_END+ '/messages';

  public async getMessages(groupId: number, pageable: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${this.baseUrl}/${groupId}`, { params: pageable });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch messages');
    }
  }

  // public async sendMessage(groupId: number, messageModel: MessageModel): Promise<MessageModel> {
  //   try {
  //     const response: AxiosResponse<MessageModel> = await axios.post(`/chat.sendMessage/${groupId}`, messageModel);
  //     return response.data;
  //   } catch (error) {
  //     throw new Error('Failed to send message');
  //   }
  // }

  // public async addUser(groupId: number, messageModel: MessageModel): Promise<MessageModel> {
  //   try {
  //     const response: AxiosResponse<MessageModel> = await axios.post(`/chat.addUser/${groupId}`, messageModel);
  //     return response.data;
  //   } catch (error) {
  //     throw new Error('Failed to add user');
  //   }
  // }
}

export default new ChatService();