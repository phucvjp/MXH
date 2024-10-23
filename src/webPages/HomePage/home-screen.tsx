import { useEffect, useState } from "react";
import {
  Bell,
  Home,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Sun,
  UserIcon,
  Users,
  Share,
  ThumbsUp,
  Star,
  Paperclip,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserService, { User } from "@/service/UserService";
import { useNavigate } from "react-router-dom";
import { Client, IMessage } from "@stomp/stompjs";
import { useQuery } from "@tanstack/react-query";
import LoadingAnimation from "@/components/ui/loadingAnimation/LoadingAnimation";
import PostService, { Post } from "@/service/PostService";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import DropzoneComponent from "@/components/ui/DropZoneComponent";
import { BACK_END } from "@/constant/domain";
import { DateUtil } from "@/service/DateUtil";
import { Separator } from "@/components/ui/separator";
import { getCookie, setCookie } from "typescript-cookie";

const formSchema = z.object({
  title: z.string(),
  content: z.string(),
  files: z.array(z.any()).max(5, { message: "Max 5 images" }),
});

export default function HomeScreen() {
  const nav = useNavigate();
  const [user, setUser] = useState<User>();
  const [friendReqs, setFriendReqs] = useState<User[]>([]);
  const token = localStorage.getItem("token");
  const [friendReqPage, setFriendReqPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [openAddImages, setOpenAddImages] = useState<boolean>(true);

  const { isLoading, isPending, isError, data, error } = useQuery({
    queryKey: ["user", token],
    queryFn: () => UserService.getUserInfo(),
    retry: 1,
    retryOnMount: false,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      files: [],
    },
  });
  useEffect(() => {
    console.log(data);
    if (data) {
      setUser(data);
      UserService.getFriendReqs(data.userId).then((data) => {
        setFriendReqs(data);
      });
      PostService.getRelatedPosts({ size: 60 }).then((res) =>
        setPosts(res.content)
      );
    }
  }, [data]);

  const createPost = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    PostService.uploadPost(data).then((response) => {
      console.log(response);
      setPosts((prev) => [response, ...prev]);
      form.reset();
    });
  };
  if (isPending) {
    return <LoadingAnimation />;
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || error) {
    console.log(error);
    localStorage.removeItem("token");
    setCookie("user", "", { expires: -1 });
    // nav("/login");
  }

  if (!localStorage.getItem("token") || !getCookie("user")) {
    nav("/login");
  }

  return (
    <div className={`min-h-screen `}>
      <div className="bg-background text-foreground">
        {/* Main Content */}
        <main className="container py-6 md:flex md:gap-6 ">
          {/* Left Sidebar */}
          <aside className="hidden md:block md:w-1/4 ">
            <nav className="space-y-2 fixed">
              <a
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent"
                href="#"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent"
                href={`/profile/${user?.userId}`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </a>
              <a
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent"
                href="#"
              >
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </a>
              <a
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent relative"
                href="messages"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
              </a>
            </nav>
          </aside>

          {/* Feed */}
          <section className="space-y-6 md:w-1/2">
            {/* Create Post */}
            <Card>
              <CardHeader>
                <CardTitle>Create Post</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(createPost)}>
                    <FormField
                      control={form.control}
                      name="title"
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
                    <div className="flex items-center my-2">
                      <div className="flex-grow">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Type a content..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <ScrollArea
                      className="h-[100px] my-3"
                      hidden={openAddImages}
                    >
                      <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => <DropzoneComponent {...field} />}
                      />
                    </ScrollArea>
                    <div className="flex justify-between">
                      <Paperclip
                        className="w-8 cursor-pointer translate-x-"
                        onClick={() => setOpenAddImages(!openAddImages)}
                      />
                      <Button type="submit" className="w-1/12">
                        Post
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {posts.map((post, i) => (
              <Card key={i} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`${BACK_END}/attachment/${post.user?.avatar}`}
                        />
                        <AvatarFallback>{post.user?.firstName}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {post.user?.firstName + " " + post.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new DateUtil(post.postDate).formatPostTime()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.title && (
                    <h3 className="font-semibold text-2xl">{post.title}</h3>
                  )}
                  <p>{post.content || ""}</p>
                  {/* attachment */}
                  <div
                    className={`grid gap-2 mt-4 grid-cols-${
                      post?.attachments?.length > 3
                        ? "3"
                        : post?.attachments?.length
                    }`}
                  >
                    {post?.attachments?.map((attachment, i) => (
                      <img
                        key={i}
                        src={`${BACK_END}/attachment/${attachment.name}`}
                        alt="Post"
                        className="rounded-md w-full"
                      />
                    ))}
                  </div>
                  <div className="flex">
                    <div className="flex">
                      {post?.likes?.length > 0 && (
                        <>
                          <ThumbsUp
                            strokeWidth={"2px"}
                            fillOpacity={"15%"}
                            fill="green"
                            className="mr-2 p-0.5 h-5 w-5 text-white bg-lime-300 rounded-full"
                          />{" "}
                          {post?.likes?.length}
                        </>
                      )}
                    </div>
                  </div>
                  <Separator className="mt-4" />
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to like post");
                          return;
                        }

                        PostService.likePost(post.post_id).then((data) => {
                          console.log(data);
                          setPosts((prev) =>
                            prev.map((p) =>
                              p.post_id === post.post_id ? data : p
                            )
                          );
                        });
                      }}
                    >
                      <ThumbsUp
                        strokeWidth={"1px"}
                        className="mr-2 h-4 w-4"
                        fill={`${
                          post?.likes?.filter(
                            (like) => like.userId === user?.userId
                          ).length > 0
                            ? "green"
                            : "none"
                        }`}
                        fillOpacity={"45%"}
                      />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" /> Comment
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Right Sidebar */}
          <aside className="mt-6 space-y-6 md:mt-0 md:w-1/4">
            {/* Friend Requests */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Friend Requests</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {friendReqs?.map((fr) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`${BACK_END}/attachment/${fr.avatar}`}
                        />
                        <AvatarFallback>{fr.firstName}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium w-3/5 truncate">
                        {fr.firstName + " " + fr.lastName}
                      </p>
                    </div>
                    <div className="space-x-2 flex">
                      <Button
                        size="sm"
                        onClick={() => {
                          UserService.addFriend(fr.userId).then(() => {
                            setFriendReqs((prev) => {
                              let i = prev.indexOf(fr);
                              prev.splice(i, 1);
                              return [...prev];
                            });
                          });
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          UserService.declineFriendReq(fr.userId).then(() => {
                            setFriendReqs((prev) => {
                              let i = prev.indexOf(fr);
                              prev.splice(i, 1);
                              return [...prev];
                            });
                          });
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Friends */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">People You May Know</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>EF</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        Emma Foster
                      </p>
                      <p className="text-sm text-muted-foreground">
                        8 mutual friends
                      </p>
                    </div>
                  </div>
                  <Button size="sm">Add Friend</Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}
