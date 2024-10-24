import { BACK_END } from "@/constant/domain";
import axios, { AxiosResponse } from "axios";
import { User } from "./UserService";
import { Message } from "./ChatService";
import { EnumValues } from "zod";

export interface Group {
  groupId: number;
  name: string;
  avatar: any;
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

export const fetchAllGroup = async () => {
  return await axios
    .get(`${BACK_END}/group/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .catch((err) => {
      console.log(err);
    });
};

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
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to create group");
    }
  }
  public async createChat(group: Group,userId:number): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await axios.post(
        `${this.baseUrl}/create/${userId}`,
        group,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to request chat");
    }
  }
}

export default new GroupService();
