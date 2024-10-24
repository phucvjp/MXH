import { BACK_END, NG_HEADER } from "@/constant/domain";
import { Attachment } from "./AttachmentService";
import { User } from "./UserService";
import axios, { AxiosResponse } from "axios";

export interface Comment {
  comment_id: number;
  content: string;
  commentDate: string;
  updateAt: string;
  user: User;
  postId: number;
  attachments: Attachment[];
}

class CmtService {
  private baseUrl: string = BACK_END + "/comment";

  public async createComment(data: any, postId: number): Promise<Comment> {
    try {
      const response: AxiosResponse<Comment> = await axios.post(
        `${this.baseUrl}/create/${postId}`,
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
}

export default new CmtService();
