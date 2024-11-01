import { BACK_END, NG_HEADER } from "@/constant/domain";
import axios, { AxiosResponse } from "axios";

import "react-toastify/dist/ReactToastify.css";

import { Attachment } from "./AttachmentService";
import { toast } from "react-toastify";
import { removeCookie, setCookie } from "typescript-cookie";

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  background: string;
  createdAt: string;
  updatedAt: string;
  friends: number[];
}

interface Account {
  email: string;
  password: string;
}

class UserService {
  private baseUrl: string = BACK_END + "/user";

  public async register(data: any): Promise<string> {
    try {
      const response: AxiosResponse<{ response: string }> = await axios
        .post(`${this.baseUrl}/register`, data, {
          headers: {
            "Content-Type": "application/json",
            ...NG_HEADER,
          },
        })
        .then((response) => {
          setCookie("user", JSON.stringify(response.data.user), { expires: 1 });
          localStorage.setItem("token", response.data.token);
          window.location.href = "/";
          toast.success("Register successfully");
          return response;
        });
      return response.data.response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        toast.error("Failed to register: " + error.response.data.response);
      } else {
        toast.error("Failed to register");
      }
      throw new Error("Failed to register");
    }
  }

  public async login(account: Account): Promise<string> {
    try {
      const response: AxiosResponse<{ token: string }> = await axios
        .post(`${this.baseUrl}/login`, account, {
          headers: {
            "Content-Type": "application/json",
            ...NG_HEADER,
          },
        })
        .then((response) => {
          setCookie("user", JSON.stringify(response.data.user), { expires: 1 });
          localStorage.setItem("token", response.data.token);
          console.log(response);
          return response;
        });
      return response.data.token;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        toast.error(error.response.data.response);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw new Error(
        axios.isAxiosError(error) && error.response
          ? error.response.data.response
          : "An unexpected error occurred"
      );
    }
  }

  public async uploadAvatar(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response: AxiosResponse<Attachment> = await axios.post(
        `${this.baseUrl}/avatar/upload`,
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

  public async uploadBG(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response: AxiosResponse<Attachment> = await axios.post(
        `${this.baseUrl}/background/upload`,
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

  public async getUserInfo(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.get(
        `${this.baseUrl}/info`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      setCookie("user", "", { expires: -1 });
      throw new Error("Failed to fetch user info");
    }
  }

  public async getAvatar(): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(
        `${this.baseUrl}/avatar`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch avatar");
    }
  }

  public logout(): void {
    try {
      localStorage.removeItem("token");
      removeCookie("user");
      setCookie("user", "", { expires: -1 });
      window.location.href = "/login";
    } catch (error) {
      throw new Error("Failed to logout");
    }
  }

  public async refreshToken(): Promise<void> {
    try {
      await axios
        .post(
          `${this.baseUrl}/refreshToken`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              ...NG_HEADER,
            },
          }
        )
        .then((response) => {
          localStorage.setItem("token", response.data.token);
        });
    } catch (error) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Failed to refresh token");
    }
  }

  public async getUserById(userId: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.get(
        `${this.baseUrl}/${userId}`,
        {
          headers: {
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        toast.error(error.response.data.response);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw new Error("Failed to fetch user info");
    }
  }
  public async getFriends(userId: number, pageable: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/friends/${userId}`,
        { params: pageable, headers: { ...NG_HEADER } }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        toast.error(error.response.data.response);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw new Error("Failed to fetch user info");
    }
  }

  public async getFriendReqs(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await axios.get(
        `${this.baseUrl}/friendsRequest`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Failed to fetch user info");
      }
      throw new Error("Failed to fetch user info");
    }
  }

  public async addFriend(userId: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.post(
        `${this.baseUrl}/addFriend/${userId}`,
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
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw new Error("Failed to add friend");
    }
  }
  public async unfriend(userId: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.post(
        `${this.baseUrl}/unfriend/${userId}`,
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
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw new Error("Failed to unfriend");
    }
  }

  public async declineFriendReq(userId: number): Promise<void> {
    try {
      await axios
        .post(
          `${this.baseUrl}/declineFrReq/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              ...NG_HEADER,
            },
          }
        )
        .then((response) => {
          console.log(response);
          toast.success(response.data);
        });
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw new Error("Failed to decline friend request");
    }
  }

  public async searchUser(search: string): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await axios.get(
        `${this.baseUrl}/search`,
        {
          params: { name: search },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        toast.error(e.response.data);
      } else {
        toast.error("Failed to search user");
      }
      throw new Error("Failed to search user");
    }
  }
}

export default new UserService();
