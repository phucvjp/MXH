import { BACK_END, NG_HEADER } from "@/constant/domain";
import axios, { AxiosResponse } from "axios";
import { User } from "./UserService";
import { Message } from "./ChatService";
import { toast } from "react-toastify";
import { Attachment } from "./AttachmentService";

export interface Group {
  groupId: number;
  name: string;
  avatar: Attachment;
  createdAt: string;
  updatedAt: string;
  users: User[];
  messages: Message[];
  admins: User[];
  type: GroupType;
  numberOfMessages: number;
}

export enum GroupType {
  GROUP = "GROUP",
  CHAT = "CHAT",
}

class GroupService {
  private baseUrl: string = BACK_END + "/group";

  public async getAllGroup(): Promise<void | Group[]> {
    try {
      console.log("hi");
      const response: AxiosResponse<Group[]> = await axios.get(
        `${this.baseUrl}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch groups");
    }
  }

  public async createGroup(groupName: string): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await axios.post(
        `${this.baseUrl}/create`,
        { name: groupName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to create group");
    }
  }
  public async createChat(group: Group, userId: number): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await axios.post(
        `${this.baseUrl}/create/${userId}`,
        group,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to create group");
    }
  }
  public async requestChat(userId: number): Promise<Group> {
    try {
      if (!localStorage.getItem("token")) {
        throw new Error("You need to login to request chat");
      }
      const response: AxiosResponse<Group> = await axios.post(
        `${this.baseUrl}/chatRequest/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to request chat");
    }
  }

  public async uploadAvatar(file: File, groupId: number): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response: AxiosResponse<Attachment> = await axios.post(
        `${this.baseUrl}/avatar/upload/${groupId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      toast.error("Failed to upload avatar");
      throw new Error("Failed to upload avatar");
    }
  }

  public async changeName(groupId: number, name: string): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await axios.post(
        `${this.baseUrl}/name/${groupId}`,
        null,
        {
          params: { name: name },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to change group name");
    }
  }
}

export default new GroupService();
