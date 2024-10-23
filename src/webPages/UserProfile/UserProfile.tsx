import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BACK_END } from "@/constant/domain";
import GroupService from "@/service/GroupService";
import UserService, { User } from "@/service/UserService";
import {
  MessageCircle,
  ThumbsUp,
  Share2,
  UserPlus,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookie } from "typescript-cookie";
import PostService, { Post } from "@/service/PostService";
import { useQuery } from "@tanstack/react-query";
import LoadingAnimation from "@/components/ui/loadingAnimation/LoadingAnimation";
import { DateUtil } from "@/service/DateUtil";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AvatarChange } from "./AvatarChange";
import { BGChange } from "./BGChange";
import { toast } from "react-toastify";

const formSchema = z.object({
  title: z.string(),
  content: z.string(),
  files: z.array(z.any()).max(5, { message: "Max 5 images" }),
});

export default function UserProfile() {
  const profileId = useParams().userId;
  const [user, setUser] = useState<User>();
  const [profile, setProfile] = useState<User>();
  const [friends, setFriends] = useState<User[]>([]);
  const [friendPage, setFriendPage] = useState(0);
  const [maxPage, setMaxPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [openAddImages, setOpenAddImages] = useState<boolean>(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bGPreview, setBGPreview] = useState<string>();

  const nav = useNavigate();

  const { isLoading, isPending, isError, data, error } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: () =>
      UserService.getUserById(parseInt(profileId || "-1")).then((data) => {
        setProfile(data);
        return data;
      }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      files: [],
    },
  });
  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "" && token !== "undefined") {
      console.log(profileId);
      setUser(JSON.parse(getCookie("user") ?? "{}"));
      scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [profileId]);

  useEffect(() => {
    setAvatarPreview(
      data?.avatar
        ? `${BACK_END}/attachment/${data?.avatar}`
        : "https://placehold.co/400?height=300&width=600&text=No Avatar"
    );
    setBGPreview(
      data?.background
        ? `${BACK_END}/attachment/${data?.background}`
        : "https://placehold.co/500x100?text=No Background"
    );
    UserService.getFriends(parseInt(profileId || "-1"), {
      page: friendPage,
      size: 12,
    }).then((data) => {
      setFriends(data.content);
      setMaxPage(data.totalPages);
    });
    PostService.getPostsByUser(parseInt(profileId || "-1")).then((data) =>
      setPosts(data)
    );
  }, [data]);

  if (isPending) {
    return <LoadingAnimation />;
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const handleMessageReq = () => {
    GroupService.requestChat(parseInt(profileId || "-1")).then((data) => {
      console.log(data);
      nav(`/messages`, {
        state: {
          tempChat: data,
        },
      });
    });
  };
  const createPost = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    PostService.uploadPost(data).then((response) => {
      console.log(response);
      setPosts((prev) => [response, ...prev]);
      form.reset();
    });
  };
  return (
    <div className="container mx-auto p-4">
      {/* Cover Photo and Avatar */}
      <div className="relative mb-8">
        {user?.userId !== profile?.userId ? (
          <img
            src={bGPreview}
            alt="Cover"
            className="w-full object-contain rounded-lg aspect-[5/1] bg-slate-100"
          />
        ) : (
          <>
            <img
              src={bGPreview}
              alt="Cover"
              className="w-full object-contain rounded-lg bg-slate-100 aspect-[5/1]"
            />
            <BGChange
              bGPreview={bGPreview || `${BACK_END}/attachment/${data?.avatar}`}
              profile={profile}
              setBGPreview={setBGPreview}
            ></BGChange>
          </>
        )}
      </div>

      {/* User Info and Actions */}
      <div className="flex relative">
        <div className="absolute bottom-0 left-4">
          {user?.userId !== profile?.userId ? (
            <Avatar
              className="w-40 h-40 border-4 border-white"
              onClick={() => {
                window.location.href = profile?.avatar
                  ? `${BACK_END}/attachment/${profile?.avatar}`
                  : "https://placehold.co/400?height=300&width=600&text=No Avatar";
              }}
            >
              <AvatarImage
                src={
                  profile?.avatar
                    ? `${BACK_END}/attachment/${profile?.avatar}`
                    : "https://placehold.co/400?height=300&width=600&text=No Avatar"
                }
                alt="User Avatar"
              />
              <AvatarFallback>{profile?.firstName}</AvatarFallback>
            </Avatar>
          ) : (
            <AvatarChange
              avatarPreview={
                avatarPreview || `${BACK_END}/attachment/${data?.avatar}`
              }
              profile={profile}
              setAvatarPreview={setAvatarPreview}
            ></AvatarChange>
          )}
        </div>
        <div className="w-40 ml-6"></div>
        <div className="flex justify-between items-end mb-8 flex-1">
          <div>
            <h1 className="text-3xl font-bold">
              {profile?.firstName + " " + profile?.lastName}
            </h1>
            <p className="text-muted-foreground"></p>
          </div>
          {user && user.userId !== profile?.userId && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  UserService.addFriend(parseInt(profileId || "-1"));
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
              <Button variant="outline" onClick={handleMessageReq}>
                <MessageCircle className="mr-2 h-4 w-4" /> Message
              </Button>
              {/* <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button> */}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Left Column - About and Friends */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p>👨‍💼 Works at Acme Inc.</p>
              <p>🎓 Studied at University of Technology</p>
              <p>🏠 Lives in New York City</p>
              <p>🌐 example.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Friends ({profile?.numberOfFriends || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {friends.length > 0 &&
                  friends?.slice(0, 6).map((friend, i) => (
                    <div key={i} className="text-center">
                      <Avatar
                        className="mx-auto mb-1 hover:cursor-pointer"
                        onClick={() => {
                          nav(`/profile/${friend.userId}`);
                        }}
                      >
                        <AvatarImage
                          src={`${BACK_END}/attachment/${friend.avatar}`}
                        />
                        <AvatarFallback>
                          {friend.firstName || ""}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs">
                        {(friend.firstName || "") +
                          " " +
                          (friend.lastName || "")}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Posts */}
        <div className="md:col-span-2 space-y-6">
          {user && user.userId === profile?.userId && (
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
                        render={({ field }) => <DropzoneComponent control={form.control} {...field} />}
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
          )}

          <Tabs defaultValue="posts">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
              {posts.map((post, i) => (
                <Card key={i} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={`${BACK_END}/attachment/${post.user?.avatar}`}
                          />
                          <AvatarFallback>{profile?.firstName}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {profile?.firstName + " " + profile?.lastName}
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
                            post.likes.filter(
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
            </TabsContent>
            <TabsContent value="about">
              <Card>
                <CardContent className="space-y-4 mt-4">
                  <h3 className="text-lg font-semibold">Work and Education</h3>
                  <p>👨‍💼 Works at Acme Inc.</p>
                  <p>🎓 Studied at University of Technology</p>

                  <h3 className="text-lg font-semibold mt-6">Places Lived</h3>
                  <p>🏠 Lives in New York City</p>
                  <p>🏡 From Chicago, Illinois</p>

                  <h3 className="text-lg font-semibold mt-6">Contact Info</h3>
                  <p>📧 john.doe@example.com</p>
                  <p>🌐 example.com</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="friends">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {friends?.map((friend, i) => (
                      <div key={i} className="text-center">
                        <Avatar className="mx-auto mb-2 h-20 w-20">
                          <AvatarImage
                            src={`${BACK_END}/attachment/${friend.avatar}`}
                          />
                          <AvatarFallback>{friend.firstName}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">
                          {friend.firstName + " " + friend.lastName}
                        </p>
                        {/* <p className="text-sm text-muted-foreground">
                          100 mutual friends
                        </p> */}
                        <Button
                          className="mt-2"
                          size="sm"
                          onClick={() => {
                            UserService.addFriend(friend.userId);
                          }}
                        >
                          Add Friend
                        </Button>
                      </div>
                    ))}
                    <Button
                      className="col-span-full"
                      onClick={() => {
                        if (friendPage >= maxPage-1) {
                          toast.error("No more friends to show");
                          return;
                        }
                        setFriendPage(friendPage + 1);
                        UserService.getFriends(parseInt(profileId || "-1"), {
                          page: friendPage + 1,
                          size: 12,
                        }).then((data) => setFriends([...friends, ...data]));
                      }}
                    >
                      See More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
