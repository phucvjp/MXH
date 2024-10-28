import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import DropzoneComponent from "@/components/ui/DropZoneComponent";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BACK_END } from "@/constant/domain";
import { Attachment } from "@/service/AttachmentService";
import CmtService, { Comment } from "@/service/CmtService";
import { Post } from "@/service/PostService";
import useRealTime from "@/service/useRealtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

const formSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
  files: z.array(z.any()).max(5, { message: "Max 5 images" }),
});

export const CommentComponent = ({ ...props }) => {
  const [showCommentInputs, setShowCommentInputs] = useState<boolean>(false);
  const replyRefs = useRef<HTMLDivElement | null>(null);
  const [openAddImages, setOpenAddImages] = useState<boolean>(true);
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      files: [],
    },
  });
  const nav = useNavigate();
  const handleReplyClick = () => {
    if (!props.user) {
      toast.error("Please login to comment");
      return;
    }
    setShowCommentInputs((prev) => !prev);
    setTimeout(() => {
      if (!showCommentInputs && replyRefs.current) {
        replyRefs.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };

  const addReplyToComment = (
    comments: Comment[],
    parentId: number,
    newReply: Comment
  ): Comment[] => {
    return comments.map((cmt) => {
      if (cmt.comment_id === parentId) {
        return {
          ...cmt,
          replies: [...(cmt.replies || []), newReply],
        };
      } else if (cmt.replies?.length > 0) {
        return {
          ...cmt,
          replies: addReplyToComment(cmt.replies, parentId, newReply),
        };
      }
      return cmt;
    });
  };

  const handleCommentReply = (data: z.infer<typeof formSchema>) => {
    CmtService.replyComment(data, props.comment.comment_id).then((data) => {
      console.log(data);
      props.setPosts((prevPosts: Post[]) => {
        return prevPosts.map((post) => {
          if (post.post_id === props.post.post_id) {
            return {
              ...post,
              comments: addReplyToComment(
                post.comments,
                props.comment.comment_id,
                data
              ),
            };
          }
          return post;
        });
      });
      form.reset({ content: "", files: [] });
      setShowCommentInputs(false);
    });
  };

  const formattedTime = useRealTime(
    props.comment.commentDate,
    "formatPostTime"
  );

  return (
    <div className={`${props.class} flex-1`}>
      <div
        key={props.comment.comment_id}
        className={`flex items-start space-x-4 bg-slate-50 rounded-xl p-3 bg-opacity-70`}
      >
        <Avatar onClick={() => nav("/profile/" + props.comment.user?.userId)}>
          <AvatarImage
            src={
              props.comment?.user?.avatar
                ? `${BACK_END}/attachment` + props.comment.user?.avatar
                : ""
            }
            alt={`${props.comment.user?.firstName}'s avatar`}
          />
          <AvatarFallback>{props.comment.user?.firstName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">
            {props.comment.user?.firstName + " " + props.comment.user?.lastName}
          </p>
          <p>{props.comment.content}</p>
          {props.comment.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {props.comment.attachments?.map((image: Attachment) => (
                <a
                  href={`${BACK_END}/attachment/` + image.name}
                  target="_blank"
                >
                  <img
                    key={image.id}
                    src={`${BACK_END}/attachment/` + image.name}
                    alt={`Comment image ${image.id}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <div>
          <span className="text-sm text-gray-400">{formattedTime}</span>
          <span>
            <Button variant="ghost" size="sm" onClick={handleReplyClick}>
              Reply
            </Button>
          </span>
        </div>
        {props.comment?.replies?.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies((prev) => !prev)}
          >
            {showReplies ? "Hide" : "Show"} Replies
          </Button>
        )}
        {showReplies &&
          props.comment?.replies?.map((reply: Comment) => (
            <div className="flex">
              <div className="border-l-2 border-b-2 border-gray-300 pl-2 h-6 w-6"></div>
              <CommentComponent
                key={reply.comment_id}
                comment={reply}
                setPosts={props.setPosts}
                post={props.post}
                user={props.user}
              />
            </div>
          ))}
        <div ref={replyRefs} className="mt-4 flex">
          {showCommentInputs && (
            <>
              <div className="border-l-2 border-b-2 border-gray-300 pl-2 h-6 w-6"></div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCommentReply)}
                  className="space-y-4 w-full"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="flex-1 mr-2"
                            placeholder="Type a title..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ScrollArea className="h-[100px] my-3" hidden={openAddImages}>
                    <FormField
                      control={form.control}
                      name="files"
                      render={({ field }) => (
                        <DropzoneComponent control={form.control} {...field} />
                      )}
                    />
                  </ScrollArea>
                  <div className="flex justify-between">
                    <Paperclip
                      className="w-8 cursor-pointer translate-x-"
                      onClick={() => setOpenAddImages(!openAddImages)}
                    />
                    <Button type="submit" className="w-fit">
                      Comment
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}{" "}
        </div>
      </div>
    </div>
  );
};
