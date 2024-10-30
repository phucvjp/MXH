import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Send,
  Phone,
  Video,
  Info,
  Image,
  Crown,
  LogOut,
  LogOutIcon,
  Star,
} from "lucide-react";
import { Client, IMessage } from "@stomp/stompjs";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import UserService, { User } from "@/service/UserService";
import { useForm } from "react-hook-form";
import GroupService, { Group } from "@/service/GroupService";
import { BACK_END, WS_BACK_END } from "@/constant/domain";
import { getCookie } from "typescript-cookie";
import ChatService, { Message } from "@/service/ChatService";
import { AddUser } from "./addUser";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface ClientProps {
  client: Client;
  group: Group;
}
import { z } from "zod";
import DropzoneComponent from "@/components/ui/DropZoneComponent";
import AttachmentService from "@/service/AttachmentService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCurrentGroup, setGroups } from "@/redux/reducers/Group";
import { useQuery } from "@tanstack/react-query";
import LoadingAnimation from "@/components/ui/loadingAnimation/LoadingAnimation";
import { ConfirmChat } from "./confirmChat";
import { MessageComponent } from "./MessageComponent";
import { CreateGroup } from "./createGroup";
import { GroupAvatarChange } from "./GroupAvatarChange";
import { GroupNameChange } from "./GroupNameChange";
const formSchema = z.object({
  token: z.string(),
  content: z.string(),
  status: z.enum(["MESSAGE"]),
  files: z.array(z.any()).max(5, { message: "Max 5 images" }),
});
export function MessagesScreen() {
  const token = localStorage.getItem("token");
  const nav = useNavigate();
  const groups = useAppSelector((state) => state.groups.value);
  const currentGroup = useAppSelector((state) => state.groups.currentGroup);
  const [clients, setClients] = useState<ClientProps[] | null>(null);
  const [user, setUser] = useState<User>();
  const [addNewGroup, setAddNewGroup] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const currentGroupRef = useRef(currentGroup);
  const groupsRef = useRef(groups);
  const [loadMessage, setLoadMessage] = useState(false);
  const [messagePage, setMessagePage] = useState(1);
  const [maxPage, setMaxPage] = useState(2);
  const [isNewMess, setIsNewMess] = useState<boolean>(false);
  const [openAddImages, setOpenAddImages] = useState<boolean>(true);
  const [attachments, setAttachments] = useState<string[]>([]);
  const location = useLocation();
  const [tempChat, setTempChat] = useState<Group | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [submited, setSubmited] = useState<boolean>(false);

  const { isLoading, isPending, isError, data, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () =>
      GroupService.getAllGroup().then((res) => {
        return res;
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: token || "",
      content: "",
      status: "MESSAGE",
      files: [],
    },
  });
  useEffect(() => {
    if (location.state?.tempChat) {
      console.log(location.state.tempChat);
      setTempChat(location.state.tempChat);
      // Clear the state after using it
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location, nav]);

  useEffect(() => {
    setAvatarPreview(
      currentGroup?.avatar
        ? `${BACK_END}/attachment/${currentGroupRef.current?.avatar?.name}`
        : currentGroupRef.current?.type === "GROUP"
        ? `/placeholder-avatar-${currentGroupRef.current?.avatar?.name}.png`
        : `${BACK_END}/attachment/${
            currentGroupRef.current?.users?.filter((user1) => {
              return user1.userId !== user?.userId;
            })[0]?.avatar || ""
          }`
    );
  }, [currentGroupRef.current]);

  useEffect(() => {
    console.log("new message", isNewMess);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.children[1].scrollTo({
        top: scrollAreaRef.current.children[1].scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isNewMess]);

  useEffect(() => {
    let now = new Date();
    if (token && token !== "" && token !== "undefined") {
      setUser(JSON.parse(getCookie("user") ?? "{}"));
      const decodedToken = jwtDecode(token || "");
      if (now.getTime() / 1000 - (decodedToken?.exp || 0) > 0) {
        nav("/login");
        return;
      } else {
        UserService.refreshToken();
        if (data) {
          let temp = [];
          let index = -1;
          index = data.findIndex((group: Group) => {
            return group.groupId === tempChat?.groupId;
          });
          if (tempChat && index === -1) {
            temp.push(tempChat);
          }
          data.forEach((group: Group) => {
            temp.push(group);
          });
          dispatch(setGroups(temp));
          dispatch(
            setCurrentGroup(
              tempChat
                ? index != -1
                  ? data[index]
                  : tempChat
                : data
                ? data[0]
                : null
            )
          );
          gotoBottom();
          setAddNewGroup(!addNewGroup);
        }
      }
    } else {
      nav("/login");
      return;
    }
  }, [data, tempChat]);

  useEffect(() => {
    if (currentGroup != null) {
      currentGroupRef.current = currentGroup;
      let temp: string[] = [];
      currentGroup?.messages?.forEach((msg, index) => {
        if (index == 0) {
          msg?.attachments?.forEach((attachment) => {
            temp.push(attachment.name);
          });
        } else if (msg?.attachments?.length > 0) {
          msg?.attachments?.forEach((attachment) => {
            if (!temp.includes(attachment.name)) {
              temp.push(attachment.name);
            }
          });
        }
      });
      setAttachments(temp.reverse());
    }
  }, [currentGroup]);

  useEffect(() => {
    if (groups != null) {
      groupsRef.current = [...(groups || [])].sort((a, b) => {
        if (!a?.messages || a?.messages?.length === 0) return -1;
        if (!b?.messages || b?.messages?.length === 0) return 1;
        return (
          b?.messages[b.messages?.length - 1]?.messageId -
          a?.messages[a.messages?.length - 1]?.messageId
        );
      });
    }
  }, [groups]);

  useEffect(() => {
    if (currentGroup != null && groups.length > 0) {
      for (let currentGroup of groups) {
        if (
          clients &&
          clients.filter((client) => {
            return client.group.groupId === currentGroup?.groupId;
          }).length > 0
        ) {
          if (
            !clients.filter((client) => {
              return client.group.groupId === currentGroup?.groupId;
            })[0].client.active
          ) {
            clients
              .filter((client) => {
                return client.group.groupId === currentGroup?.groupId;
              })[0]
              .client.activate();
            // clients
            //   .filter((client) => {
            //     return client.group.groupId === currentGroup?.groupId;
            //   })[0]
            //   .client.subscribe(
            //     "/topic/public/" + currentGroup?.groupId,
            //     onMessageReceived
            //   );
            console.log(
              clients.filter((client) => {
                return client.group.groupId === currentGroup?.groupId;
              })[0].client
            );
          }
          continue;
        }
        if (!currentGroup?.groupId) {
          continue;
        }
        const newClient = new Client({
          brokerURL: `${WS_BACK_END}/message`,
          onConnect: () => {
            newClient.subscribe(
              "/topic/public/" + currentGroup?.groupId,
              onMessageReceived
            );
            console.log("Connected :" + currentGroup?.name);
          },
          onDisconnect: () => {
            console.log("Disconnected :" + currentGroup?.name);
            const clientIndex = clients?.findIndex((client) => {
              return client.group.groupId === currentGroup?.groupId;
            });
            if (clientIndex !== undefined && clientIndex !== -1) {
              clients?.splice(clientIndex, 1);
            }
          },
          onStompError: (error) => {
            console.error(
              "Could not connect to WebSocket server. Please refresh this page to try again!",
              error
            );
          },
        });
        newClient.activate();
        setClients((client) => {
          if (client == null) {
            return [
              {
                client: newClient,
                group: currentGroup,
              },
            ];
          }
          if (
            client.filter((client) => {
              return client.group.groupId === currentGroup?.groupId;
            }).length > 0
          ) {
            return client;
          }
          return [
            ...(client || []),
            {
              client: newClient,
              group: currentGroup,
            },
          ];
        });
      }
    }

    return () => {
      if (clients != null) {
        clients.forEach((client) => {
          if (client.client.connected) {
            console.log("deactivating client:" + client.group.groupId);
            client.client.deactivate();
            // client.client.unsubscribe("/topic/public/" + client.group.groupId); // unsubscribe from the topic\
            // client.client.forceDisconnect();
          }
        });
      }
      // setClients(null);
    };
  }, [addNewGroup, clients]);

  const gotoBottom = () => {
    setIsNewMess((prev) => !prev);
  };
  const onMessageReceived = (payload: IMessage) => {
    console.log(payload);
    const pl = JSON.parse(payload.body);
    console.log(pl);
    if (pl.statusCodeValue != 200) {
      toast.error(pl.body);
      return;
    }
    const message = pl.body;
    if (message?.status == "MESSAGE" || message?.status == "ANNOUNCE") {
      const newMessage: Message = {
        messageId: message.messageId,
        content: message.content,
        sendAt: message.sendAt,
        updateAt: message.updateAt,
        user: message.user,
        status: message.status,
        attachments: message.attachments,
        groupId: message.groupId,
      };

      if (message?.groupId === currentGroupRef.current?.groupId) {
        gotoBottom();
        if (
          [
            ...(currentGroup?.messages || []),
            ...(currentGroupRef.current?.messages || []),
          ].filter((msg) => {
            return msg.messageId === message.messageId;
          }).length > 0
        )
          return;
        dispatch(
          setCurrentGroup({
            ...currentGroupRef.current,
            users:
              message?.status == "ANNOUNCE" &&
              currentGroupRef.current?.users?.filter((u) => {
                return u.userId === message.user.userId;
              }).length === 0
                ? [...currentGroupRef.current?.users, message.user]
                : [...(currentGroupRef.current?.users || [])],
            messages: [
              ...(currentGroupRef.current?.messages || []),
              newMessage,
            ],
          })
        );
      }
      dispatch(
        setGroups(
          groupsRef.current?.map((group) => {
            if (group.groupId === newMessage?.groupId) {
              return {
                ...group,
                users:
                  message?.status == "ANNOUNCE" &&
                  group?.users?.filter((u) => {
                    return u.userId === message.user.userId;
                  }).length === 0
                    ? [...group.users, message.user]
                    : [...group.users],
                messages: [...(group.messages || []), newMessage],
              };
            }
            return group;
          })
        )
      );
    }
  };

  const sendMessage = (data: z.infer<typeof formSchema>) => {
    let message: {
      token: string;
      content: string;
      status: string;
      files: string[];
    } = {
      token: data.token,
      content: data.content,
      status: data.status,
      files: [],
    };
    if (clients != null) {
      if (data.content === "" && data.files.length === 0) return;
      if (data.files.length > 0) {
        AttachmentService.uploadImage(data.files).then((attachments) => {
          message.files = attachments;
          console.log(message);
          clients
            .filter((client) => {
              return client.group.groupId === currentGroupRef.current?.groupId;
            })[0]
            .client.publish({
              destination:
                "/app/chat.sendMessage/" + currentGroupRef.current?.groupId,
              body: JSON.stringify(message),
            });
          form.reset();
          form.setValue("files", []);
        });
      } else {
        clients
          .filter((client) => {
            return client.group.groupId === currentGroupRef.current?.groupId;
          })[0]
          .client.publish({
            destination:
              "/app/chat.sendMessage/" + currentGroupRef.current?.groupId,
            body: JSON.stringify(message),
          });
        form.reset();
        form.setValue("files", []);
      }
      setSubmited((prev) => !prev);
      setOpenAddImages(true);
      form.reset();
    }
  };


  const handleChangeGroup = (group: Group) => {
    // dispatch(
    //   setGroups(
    //     groups.map((group) => {
    //       messages.forEach((msg) => {
    //         return {
    //           ...group,
    //           messages: [
    //             ...group.messages,
    //             {
    //               messageId: msg.messageId,
    //               content: msg.content,
    //               sendAt: msg.sendAt,
    //               updateAt: msg.updateAt,
    //               user: msg.user,
    //               status: msg.status,
    //               attachments: msg.attachments,
    //               groupId: msg.groupId,
    //             },
    //           ],
    //         };
    //       });
    //       return group;
    //     })
    //   )
    // );
    dispatch(setCurrentGroup(group));
    gotoBottom();
    setMessagePage(1);
    setMaxPage(2);
  };

  const handleLoadMessages = () => {
    if (
      messagePage >= maxPage ||
      currentGroupRef.current?.numberOfMessages ==
        currentGroupRef.current?.messages.length
    )
      return;
    setMessagePage(messagePage + 1);
    console.log(messagePage);
    setLoadMessage(true);
    ChatService.getMessages(currentGroupRef.current?.groupId || 0, {
      page: messagePage,
      size: 12,
    }).then((res) => {
      console.log(res);
      setMaxPage(res.totalPages);
      let temp = res.content;
      let newMsgs: Message[] = [];
      if (currentGroupRef.current?.messages) {
        newMsgs = [...currentGroupRef.current?.messages];
      } else {
        newMsgs = [];
      }
      temp.forEach((msg: Message) => {
        if (
          currentGroupRef.current?.messages.filter((message) => {
            return message.messageId === msg.messageId;
          }).length === 0
        ) {
          newMsgs = [
            {
              messageId: msg.messageId,
              content: msg.content,
              sendAt: msg.sendAt,
              updateAt: msg.updateAt,
              user: msg.user,
              status: msg.status,
              attachments: msg.attachments,
              groupId: msg.groupId,
            },
            ...(newMsgs || []),
          ];
        }
      });

      dispatch(
        setCurrentGroup({
          ...currentGroupRef.current,
          numberOfMessages: res.totalElements,
          messages: [...newMsgs],
        })
      );
      setLoadMessage(false);
    });
  };

  const handleViewPro = (userId: number) => {
    if (userId === 0) return;
    nav(`/profile/${userId}`);
  };

  if (isPending) {
    return <LoadingAnimation />;
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      {" "}
      <div className="flex h-screen bg-gray-100">
        {/* Left Sidebar - Chat List */}
        <div className=" w-1/4 bg-white border-r flex flex-col justify-between">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div
                className="mr-6 flex items-center space-x-2 hover:cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  nav("/");
                }}
              >
                <span className="font-bold inline-block">
                  <Star className="h-6 w-6" strokeWidth={"1px"} fill="yellow" />
                </span>
              </div>
              <h2 className="text-xl font-bold">Chats</h2>
              <CreateGroup
                dispatch={dispatch}
                setGroups={setGroups}
                groups={groups}
                setAddNewGroup={setAddNewGroup}
              />
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input className="pl-8" placeholder="Search groups" />
            </div>
          </div>
          <ScrollArea className="flex-1 h-[calc(100vh-150px)] max-h-full">
            <>
              {groupsRef.current
                // .sort((a, b) => {
                //   return (
                //     b.messages[b.messages.length - 1].messageId -
                //     a.messages[a.messages.length - 1].messageId
                //   );
                // })
                .map((group) => {
                  return (
                    <div
                      key={group.groupId}
                      className="flex items-center p-4 hover:bg-gray-100 cursor-pointer group"
                      onClick={() => {
                        handleChangeGroup(group);
                      }}
                    >
                      <Avatar
                        className="h-12 w-12"
                        onClick={() => {
                          group.type !== "GROUP" &&
                            handleViewPro(
                              group.users?.filter((user1) => {
                                return user1.userId !== user?.userId;
                              })[0].userId || 0
                            );
                        }}
                      >
                        <AvatarImage
                          src={
                            group.groupId == currentGroup?.groupId
                              ? avatarPreview
                              : group?.avatar
                              ? `${BACK_END}/attachment/${group?.avatar.name}`
                              : group.type === "GROUP"
                              ? `/placeholder-avatar-${group.groupId}.png`
                              : `${BACK_END}/attachment/${
                                  group.users?.filter((user1) => {
                                    return user1.userId !== user?.userId;
                                  })[0]?.avatar || ""
                                }`
                          }
                          alt={
                            group.type === "GROUP"
                              ? group.name
                              : group.users?.filter((user1) => {
                                  return user1.userId !== user?.userId;
                                })[0]?.firstName
                          }
                        />
                        <AvatarFallback>
                          {group.type === "GROUP"
                            ? group.name?.slice(0, 2)?.toUpperCase()
                            : group.users?.filter((user1) => {
                                return user1.userId !== user?.userId;
                              })[0]?.firstName}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-1  relative hidden md:block">
                        <h3 className="font-semibold">
                          {group.type === "GROUP"
                            ? group.name
                            : group.users?.filter((user1) => {
                                return user1.userId !== user?.userId;
                              })[0]?.firstName +
                              " " +
                              group.users?.filter((user1) => {
                                return user1.userId !== user?.userId;
                              })[0]?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate ">
                          {group?.messages?.length > 0
                            ? group.messages[group.messages.length - 1]
                                .attachments?.length > 0
                              ? group.messages[group.messages.length - 1].user
                                  .firstName + ": Image"
                              : group.messages[group.messages.length - 1].user
                                  .firstName +
                                ": " +
                                group.messages[group.messages.length - 1]
                                  .content
                            : ""}
                        </p>
                        <button
                          type="button"
                          className="absolute top-1/2 right-2 -translate-y-1/2 hidden group-hover:block "
                        >
                          <LogOutIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </>
          </ScrollArea>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              UserService.logout();
            }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Log out
          </Button>
        </div>

        {/* Center - Current Chat */}
        <div className="flex-1 flex flex-col w-1/2 ">
          <div className="bg-white p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
              <Avatar
                className="h-12 w-12"
                onClick={() => {
                  currentGroupRef.current?.type !== "GROUP" &&
                    handleViewPro(
                      currentGroupRef.current?.users?.filter((user1) => {
                        return user1.userId !== user?.userId;
                      })[0].userId || 0
                    );
                }}
              >
                <AvatarImage
                  src={avatarPreview}
                  alt={
                    currentGroupRef.current?.type === "GROUP"
                      ? currentGroupRef.current?.name
                      : currentGroupRef.current?.users?.filter((user1) => {
                          return user1.userId !== user?.userId;
                        })[0]?.firstName
                  }
                />
                <AvatarFallback>
                  {currentGroupRef.current?.type === "GROUP"
                    ? currentGroupRef.current?.name?.slice(0, 2)?.toUpperCase()
                    : currentGroupRef.current?.users?.filter((user1) => {
                        return user1.userId !== user?.userId;
                      })[0]?.firstName}
                </AvatarFallback>
              </Avatar>
              <h2 className="ml-4 text-xl font-semibold">
                {currentGroupRef.current?.type === "GROUP"
                  ? currentGroupRef.current?.name
                  : (currentGroupRef.current?.users?.filter((user1) => {
                      return user1.userId !== user?.userId;
                    })[0]?.firstName || "") +
                    " " +
                    (currentGroupRef.current?.users?.filter((user1) => {
                      return user1.userId !== user?.userId;
                    })[0]?.lastName || "")}
              </h2>
            </div>
            <div className="flex space-x-2 ">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <ScrollArea
            className="flex-1 p-4"
            ref={scrollAreaRef}
            onScrollCapture={(e) => {
              if ((e.target as HTMLDivElement).scrollTop === 0) {
                console.log("fetching more messages");
                handleLoadMessages();
              }
            }}
          >
            <div className="h-24" hidden={!loadMessage}>
              <LoadingAnimation className="h-auto relative p-4" />
            </div>
            {currentGroup?.messages?.map((msg, index) => (
              <MessageComponent
                key={index}
                msg={msg}
                user={user}
                handleViewPro={handleViewPro}
              ></MessageComponent>
            ))}
          </ScrollArea>
          <div className="bg-white p-4 border-t ">
            <div className="flex items-center">
              {currentGroupRef.current?.groupId === undefined &&
              currentGroupRef.current?.type === "CHAT" &&
              currentGroupRef.current?.messages == undefined ? (
                <ConfirmChat
                  group={currentGroupRef.current}
                  user={user}
                ></ConfirmChat>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(sendMessage)}
                    className="flex flex-col gap-6 w-full"
                  >
                    <ScrollArea className="h-[100px]" hidden={openAddImages}>
                      <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => (
                          <DropzoneComponent
                            submited={submited}
                            control={form.control}
                            {...field}
                          />
                        )}
                      />
                    </ScrollArea>
                    <div className="flex items-center">
                      <Image
                        className="w-8 cursor-pointer translate-x-"
                        onClick={() => setOpenAddImages(!openAddImages)}
                      />
                      <div className="flex-grow">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="flex-1 mr-2"
                                  placeholder="Type a message..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-12 mx-2">
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat Info */}
        <ScrollArea className="hidden w-1/4 bg-white border-l p-4 sm:block">
          <h2 className="text-xl font-bold mb-4">Chat Info</h2>
          <div className="mb-4">
            <div className="h-fit flex items-center justify-center">
              {currentGroupRef.current?.type === "GROUP" ? (
                <GroupAvatarChange
                  avatarPreview={avatarPreview}
                  group={currentGroupRef.current}
                  setAvatarPreview={setAvatarPreview}
                />
              ) : (
                <Avatar
                  className="sm:h-24 sm:w-24 md:h-32 md:w-32 border-4 border-white hover:cursor-pointer"
                  onClick={() => {
                    currentGroupRef.current?.type !== "GROUP" &&
                      handleViewPro(
                        currentGroupRef.current?.users?.filter((user1) => {
                          return user1.userId !== user?.userId;
                        })[0].userId || 0
                      );
                  }}
                >
                  <AvatarImage
                    src={avatarPreview}
                    alt={
                      currentGroupRef.current?.users?.filter((user1) => {
                        return user1.userId !== user?.userId;
                      })[0]?.firstName
                    }
                  />
                  <AvatarFallback>
                    {
                      currentGroupRef.current?.users?.filter((user1) => {
                        return user1.userId !== user?.userId;
                      })[0]?.firstName
                    }
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex items-center justify-center">
              {currentGroupRef.current?.type === "GROUP" ? (
                <>
                  <h2 className="text-xl font-semibold">
                    {currentGroupRef.current?.name}
                  </h2>
                  <GroupNameChange
                    group={currentGroupRef.current}
                    dispatch={dispatch}
                    setGroups={setGroups}
                    setCurrentGroup={setCurrentGroup}
                    groups={groups}
                  />
                </>
              ) : (
                <h2 className="text-xl font-semibold">
                  {currentGroupRef.current?.users?.filter((user1) => {
                    return user1.userId !== user?.userId;
                  })[0]?.firstName +
                    " " +
                    currentGroupRef.current?.users?.filter((user1) => {
                      return user1.userId !== user?.userId;
                    })[0]?.lastName}
                </h2>
              )}
            </div>
            {currentGroupRef.current?.type === "GROUP" && (
              <>
                <Separator className="my-4" />
                <div className="flex justify-between items-end">
                  <h3 className="font-semibold mb-2">Members</h3>
                  {user &&
                  currentGroup &&
                  currentGroup?.admins?.filter((admin) => {
                    return admin.userId === user?.userId;
                  }).length > 0 ? (
                    <AddUser
                      client={
                        clients?.filter((client) => {
                          return client.group.groupId === currentGroup?.groupId;
                        })[0].client
                      }
                      currentGroup={currentGroup}
                      token={token}
                    />
                  ) : null}
                </div>

                {currentGroup?.users.map((member, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Avatar
                      onClick={() => handleViewPro(member.userId)}
                      className="h-8 w-8 mr-2 hover:cursor-pointer"
                    >
                      <AvatarFallback>
                        {(member?.firstName || "").slice(0, 1).toUpperCase() +
                          (member?.lastName || "").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                      <AvatarImage
                        src={
                          member?.avatar
                            ? `${BACK_END}/attachment/${member?.avatar}`
                            : ""
                        }
                        alt={member?.firstName}
                      />
                    </Avatar>
                    <span>
                      {(member?.firstName || "") +
                        " " +
                        (member?.lastName || "")}
                    </span>
                    {currentGroup?.admins?.filter((admin) => {
                      return admin.userId === member.userId;
                    }).length > 0 ? (
                      <Crown className="h-5 w-5 ml-auto" />
                    ) : null}
                  </div>
                ))}
              </>
            )}
          </div>
          <Separator className="my-4" />
          <div>
            <h3 className="font-semibold mb-2">Shared Photos</h3>
            <ScrollArea className="h-[calc(48vh)]">
              <div className="flex flex-wrap p-4">
                {attachments.map((attachment, index) => {
                  if (attachment?.length > 0) {
                    return (
                      <div key={index} className="flex m-1">
                        <LazyLoadImage
                          src={
                            attachment
                              ? `${BACK_END}/attachment/${attachment}`
                              : ""
                          }
                          alt={`${attachment}`}
                          className="h-16 w-16 object-cover rounded-lg hover:cursor-pointer fle"
                          loading="lazy"
                          onClick={() => {
                            window.open(`${BACK_END}/attachment/${attachment}`);
                          }}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </ScrollArea>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
