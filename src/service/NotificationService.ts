import { BACK_END, NG_HEADER } from "@/constant/domain";
import axios, { AxiosResponse } from "axios";
import { User } from "./UserService";

export interface Notifi {
  id: number;
  content: string;
  title: string;
  user: User;
  isRead: boolean;
  isSeen: boolean;
  createdAt: string;
  link: string;
  type: NotifiType;
}

export enum NotifiType {
  COMMENT = "COMMENT",
  LIKE = "LIKE",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  SHARE = "SHARE",
  POST = "POST",
  FRIEND_ACCEPT = "FRIEND_ACCEPTED",
  SYSTEM = "SYSTEM",
}

class NotificationService {
  private baseUrl: string = BACK_END + "/notification";

  public async getNotifications(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${this.baseUrl}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...NG_HEADER,
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch notifications");
    }
  }

  public async markAsRead(id: number): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/markAsRead/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
    } catch (error) {
      throw new Error("Failed to mark as read");
    }
  }

  public async markAsSeen(id: number): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/markAsSeen/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
    } catch (error) {
      throw new Error("Failed to mark as seen");
    }
  }
}

export default new NotificationService();
