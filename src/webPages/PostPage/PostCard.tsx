import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { BACK_END } from "@/constant/domain";
import { Attachment } from "@/service/AttachmentService";
import CmtService, { Comment } from "@/service/CmtService";
import PostService, { Post } from "@/service/PostService";
import { User } from "@/service/UserService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { CommentComponent } from "./CommentComponent";
import { formatDistanceToNow } from "date-fns";

const formSchema = z.object({
  postId: z.number(),
  content: z.string(),
  files: z.array(z.any()).max(5, { message: "Max 5 images" }),
});

export const PostCard = ({ ...props }) => {
  const [showCommentInputs, setShowCommentInputs] = useState<boolean>(false);
  const commentRefs = useRef<HTMLDivElement | null>(null);
  const [openAddImages, setOpenAddImages] = useState<boolean>(true);
  const nav = useNavigate();
  // const [post, setPost] = useState<Post>();

  // useEffect(() => {
  //   props.setPosts((prev: Post[]) =>
  //     prev.map((p) => (p.post_id === post?.post_id ? post : p))
  //   );
  // }, [post]);

  // useEffect(() => {
  //   if (props.post) {
  //     setPost(props.post);
  //   }
  // }, [props.post]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postId: props.post?.post_id || 0,
      content: "",
      files: [],
    },
  });
  const handleCommentClick = () => {
    setShowCommentInputs((prev) => !prev);
    setTimeout(() => {
      if (!showCommentInputs && commentRefs.current) {
        commentRefs.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };
  const handleCommentSubmit = (data: z.infer<typeof formSchema>) => {
    CmtService.createComment(data, props.post.post_id).then((data) => {
      console.log(data);
      props.setPosts((prev: Post[]) =>
        prev.map((p) =>
          p.post_id === data.postId
            ? { ...p, comments: [...p.comments, data] }
            : p
        )
      );
      form.reset({ content: "", files: [] });
      setShowCommentInputs(false);
    });
  };

  return (
    <Card key={props.i} className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar
              onClick={() => {
                nav("/profile/" + props.post?.user?.userId);
              }}
            >
              <AvatarImage
                src={
                  props.post?.user?.avatar
                    ? `${BACK_END}/attachment/${props.post?.user?.avatar}`
                    : ""
                }
              />
              <AvatarFallback>{props.post?.user?.firstName}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {props.post?.user?.firstName + " " + props.post?.user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(props.post?.postDate), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.post?.title && (
          <h3 className="font-semibold text-2xl">{props.post?.title}</h3>
        )}
        <p>{props.post?.content || ""}</p>
        {/* attachment */}
        <div
          className={`grid gap-2 mt-4 grid-cols-${
            props.post?.attachments?.length > 3
              ? "3"
              : props.post?.attachments?.length
          }`}
        >
          {props.post?.attachments?.map((attachment: Attachment, i: number) => (
            <img
              key={i}
              src={
                attachment?.name
                  ? `${BACK_END}/attachment/${attachment.name}`
                  : ""
              }
              alt="Post"
              className="rounded-md w-full"
            />
          ))}
        </div>
        <div className="flex">
          <div className="flex">
            {props.post?.likes?.length > 0 && (
              <>
                <ThumbsUp
                  strokeWidth={"2px"}
                  fillOpacity={"15%"}
                  fill="green"
                  className="mr-2 p-0.5 h-5 w-5 text-white bg-lime-300 rounded-full"
                />{" "}
                {props.post?.likes?.length}
              </>
            )}
          </div>
        </div>
        <Separator className="mt-2" />
        <div className="flex justify-between items-center mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!props.user) {
                toast.error("Please login to like post");
                return;
              }

              PostService.likePost(props.post.post_id).then((data) => {
                console.log(data);
                props.setPosts((prev: Post[]) =>
                  prev.map((p) => (p.post_id === props.post.post_id ? data : p))
                );
              });
            }}
          >
            <ThumbsUp
              strokeWidth={"1px"}
              className="mr-2 h-4 w-4"
              fill={`${
                props.post?.likes?.filter(
                  (like: User) => like.userId === props.user?.userId
                ).length > 0
                  ? "green"
                  : "none"
              }`}
              fillOpacity={"45%"}
            />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!props.user) {
                toast.error("Please login to comment");
                return;
              }
              handleCommentClick();
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(
                window.location.hostname +
                  (window.location.port.length > 0
                    ? ":" + window.location.port
                    : "") +
                  "/post/" +
                  props.post?.post_id
              );
              toast.success("Copied to clipboard");
            }}
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
        <Separator className="mt-1" />
        <div className="mt-4 space-y-4">
          {props.post?.comments?.map((comment: Comment) => (
            <CommentComponent
              key={comment.comment_id}
              comment={comment}
              setPosts={props.setPosts}
              post={props.post}
              user={props.user}
            />
          ))}
        </div>
        {showCommentInputs && (
          <div ref={commentRefs} className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCommentSubmit)}
                className="space-y-4"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
