import { BACK_END, NG_HEADER } from "@/constant/domain";
import axios, { AxiosResponse } from "axios";
import { Attachment } from "./AttachmentService";
import { User } from "./UserService";

export interface Post {
  post_id: number;
  title: string;
  content: string;
  postDate: string;
  attachments: Attachment[];
  user: any;
  likes: User[];
  comments: any[];
}

interface PostModel {
  title: string;
  content: string;
  attachments: File[];
}

class PostService {
  private baseUrl: string = BACK_END + "/post";

  public async uploadPost(data: any): Promise<Post> {
    try {
      const response: AxiosResponse<Post> = await axios.post(
        `${this.baseUrl}/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to upload post");
    }
  }

  public async getPostsByUser(userId: number): Promise<Post[]> {
    try {
      const response: AxiosResponse<Post[]> = await axios.get(
        `${this.baseUrl}/user/${userId}`,
        {
          headers: {
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch posts");
    }
  }

  public async likePost(postId: number): Promise<Post> {
    try {
      const response: AxiosResponse<Post> = await axios.get(
        `${this.baseUrl}/like/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to like post");
    }
  }

  public async getRelatedPosts(page: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/related`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...NG_HEADER,
          },
          params: page,
        }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch posts");
    }
  }
}

export default new PostService();
