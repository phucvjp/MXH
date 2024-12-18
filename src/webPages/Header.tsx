import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BACK_END, WS_BACK_END } from "@/constant/domain";
import UserService, { User } from "@/service/UserService";
import { Notifi } from "@/service/NotificationService";

import { Client, IMessage } from "@stomp/stompjs";
import { useQuery } from "@tanstack/react-query";

import {
  Bell,
  Home,
  LogOut,
  Menu,
  MessageCircleMore,
  Network,
  Search,
  Settings,
  Star,
  UserIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "typescript-cookie";
import { Notification } from "./Noti/Notification";

export const Header = ({ ...props }) => {
  const [messagePing, setMessagePing] = useState<boolean>(false);
  const [notiPing, setNotiPing] = useState<boolean>(false);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<User>();
  const [searchUsers, setSearchUsers] = useState<User[]>();
  const [input, setInput] = useState<string>("");
  const [newNoti, setNewNoti] = useState<Notifi | null>(null);

  const nav = useNavigate();

  const { isLoading, isPending, isError, data, error } = useQuery({
    queryKey: ["user", token],
    queryFn: () => UserService.getUserInfo(),
    retry: 1,
    retryOnMount: false,
  });
  useEffect(() => {
    if (data) {
      setUser(data);
      const newClient = new Client({
        brokerURL: `${WS_BACK_END}/message`,
        onConnect: () => {
          newClient.subscribe(
            "/topic/private/" + data.email,
            onMessageReceived
          );
        },
        onDisconnect: () => {
          console.log("Disconnected :" + data.firstName);
        },
        onStompError: (error) => {
          console.error(
            "Could not connect to WebSocket server. Please refresh this page to try again!",
            error
          );
        },
      });
      newClient.activate();
      return () => {
        newClient.deactivate();
        newClient.unsubscribe("/topic/private/" + data.userId); // unsubscribe from the topic
      };
    }
  }, [data]);

  if (!localStorage.getItem("token") || !getCookie("user")) {
    localStorage.removeItem("token");
    setCookie("user", "", { expires: -1 });
  }

  if (
    isError ||
    error ||
    !localStorage.getItem("token") ||
    !getCookie("user")
  ) {
    console.log(error);
    return (
      <header
        className={`${props.className} max-w-full top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60  h-[6.5vh] flex justify-end`}
      >
        <Button
          className="m-2"
          onClick={() => {
            localStorage.removeItem("token");
            setCookie("user", "", { expires: -1 });
            nav("/login");
          }}
        >
          Login
        </Button>
      </header>
    );
  } else if (isLoading || isPending) return <></>;

  const onMessageReceived = (payload: IMessage) => {
    if (payload.body != "New message") {
      const pl: Notifi = JSON.parse(payload.body);
      if (pl)
        if (pl.type === "FRIEND_REQUEST") {
          console.log("New Friend Request Received!");
        } else if (pl.type === "FRIEND_ACCEPTED") {
          console.log("Friend Request Accepted!");
        } else if (pl.type === "LIKE") {
          console.log("New Like Received!");
        } else if (pl.type === "COMMENT") {
          console.log("New Comment Received!");
        }
      setNotiPing(true);
      setTimeout(() => setNotiPing(false), 3000);
      setNewNoti(pl);
      return;
    }
    let oldTitle = document.title;
    let msg = "New Message Received!";
    let timeoutId: ReturnType<typeof setInterval> | null = null;
    let blink = () => {
      document.title = document.title === msg ? oldTitle : msg;
    };
    let clear = () => {
      if (timeoutId) {
        clearInterval(timeoutId);
      }
      document.title = oldTitle;
      window.onmousemove = null;
      timeoutId = null;
    };
    if (!timeoutId) {
      timeoutId = setInterval(blink, 1000);
      window.onmousemove = clear;
    }
    console.log(payload.body);
    setMessagePing(true);
    new Audio("/simple-notification-152054.mp3").play();
    setTimeout(() => setMessagePing(false), 3000);
  };
  const handleSearch = (input: string) => {
    if (input) {
      setInput(input);
      UserService.searchUser(input).then((res) => setSearchUsers(res));
    }
  };

  return (
    <header
      className={`${props.className} top-0 z-50  max-w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="container flex h-[6.5vh] items-center">
        <div className="mr-4 hidden md:flex">
          <div
            className="mr-6 flex items-center space-x-2 hover:cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              nav("/");
            }}
          >
            <span className="hidden font-bold sm:inline-block">
              <Star className="h-6 w-6" strokeWidth={"1px"} fill="yellow" />
            </span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <div
              className="transition-colors hover:text-foreground/80 text-foreground/60 hover:cursor-pointer flex"
              onClick={(e) => {
                e.preventDefault();
                nav("/");
              }}
            >
              <Home className="h-4 w-4 mr-2" /> Home
            </div>
            <div
              className="transition-colors hover:text-foreground/80 text-foreground/60 hover:cursor-pointer "
              onClick={(e) => {
                e.preventDefault();
                window.open(`${BACK_END}`);
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 flex">
                      <Network className="h-4 w-4 mr-2" /> Network
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click here if you got image fetching problems</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative hover:cursor-pointer">
              <div
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex"
                onClick={(e) => {
                  e.preventDefault();
                  nav("/messages");
                }}
              >
                <MessageCircleMore className="h-4 w-4 mr-2" /> Messages
              </div>
              {messagePing && (
                <div className="w-4 h-4 rounded-full bg-red-500 animate-ping absolute z-50 -top-1 -right-2 " />
              )}
            </div>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Menu
                </h2>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      nav("/");
                    }}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`${BACK_END}`);
                    }}
                  >
                    <Network className="mr-2 h-4 w-4" />
                    Network
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      nav("/messages");
                    }}
                  >
                    <MessageCircleMore className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-8 md:w-[300px] lg:w-[300px]"
                onChange={(e) => {
                  if (e.target.value) handleSearch(e.target.value);
                  else {
                    setInput("");
                    setSearchUsers([]);
                  }
                }}
                value={input}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.target as HTMLInputElement).value
                  ) {
                    handleSearch((e.target as HTMLInputElement).value);
                  } else if (!(e.target as HTMLInputElement).value) {
                    setSearchUsers([]);
                  }
                }}
              />
              {input && (
                <X
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground"
                  onClick={() => {
                    setInput("");
                    setSearchUsers([]);
                  }}
                />
              )}
            </div>
            <div className="absolute bg-gray-50 rounded-lg md:w-[300px] lg:w-[300px]">
              {searchUsers?.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center p-2 space-x-2 hover:bg-gray-200 hover:rounded-lg"
                  onClick={() => {
                    setSearchUsers([]);
                    nav("/profile/" + user.userId);
                  }}
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        user?.avatar
                          ? `${BACK_END}/attachment/${user?.avatar}`
                          : ""
                      }
                      alt="@user"
                    />
                    <AvatarFallback>{user.firstName}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="">{user.firstName + " " + user.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild></TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <div className="relative">
                  {" "}
                  <Bell className="h-4 w-4" />
                  {notiPing && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute z-50 -top-1 -right-1 " />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Notification newNoti={newNoti} user={user} />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  nav("/profile/" + user?.userId);
                }}
              >
                <Avatar>
                  <AvatarImage
                    src={
                      user?.avatar
                        ? `${BACK_END}/attachment/${user?.avatar}`
                        : ""
                    }
                    alt="@user"
                  />
                  <AvatarFallback>{user?.firstName}</AvatarFallback>
                </Avatar>

                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className=" p-2">
                <DropdownMenuItem
                  className="flex flex-col items-start leading-none border-collapse border w-full p-2 rounded-md shadow-lg hover:cursor-pointer hover:bg-slate-50"
                  onClick={() => {
                    nav("/profile/" + user?.userId);
                  }}
                >
                  <p className="font-medium">
                    {(user?.firstName || "") + " " + (user?.lastName || "")}
                  </p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  nav("/profile/" + user?.userId);
                }}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  UserService.logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
