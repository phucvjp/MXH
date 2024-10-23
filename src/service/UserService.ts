import { Avatar } from "@/components/ui/avatar";
import { BACK_END, NG_HEADER } from "@/constant/domain";
import axios, { AxiosResponse } from "axios";
import { getCookie, setCookie } from "typescript-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { set } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Attachment } from "./AttachmentService";

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  background: string;
  createdAt: string;
  updatedAt: string;
  numberOfFriends: number;
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
          window.location.href = "/messages";
          toast.success("Register successfully");
          return response;
        });
      return response.data.response;
    } catch (error) {
      toast.error("Failed to register: " + error?.response?.data?.response);
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
      toast.error(error?.response?.data?.response);
      throw new Error(error?.response?.data?.response);
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

  public async logout(): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/logout`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...NG_HEADER,
        },
      });
      localStorage.removeItem("token");
      setCookie("user", "", { expires: -1 });
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
      toast.error(error?.response?.data?.response);
      throw new Error("Failed to fetch user info");
    }
  }
  public async getFriends(userId: number, pageable: any): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await axios.get(
        `${this.baseUrl}/friends/${userId}`,
        { params: pageable, headers: { ...NG_HEADER } }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.response);
      throw new Error("Failed to fetch user info");
    }
  }

  public async getFriendReqs(userId: number): Promise<User[]> {
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
      toast.error(error?.response?.data?.response);
      throw new Error("Failed to fetch user info");
    }
  }

  public async addFriend(userId: number): Promise<void> {
    try {
      await axios
        .post(
          `${this.baseUrl}/addFriend/${userId}`,
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
      toast.error(error?.response?.data);
      throw new Error("Failed to add friend");
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
      toast.error(error?.response?.data);
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
      toast.error(e?.response?.data);
      throw new Error("Failed to search user");
    }
  }
}

export default new UserService();
