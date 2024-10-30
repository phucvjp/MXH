import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BACK_END } from "@/constant/domain";
import UserService, { User } from "@/service/UserService";
import { DialogClose } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import React from "react";

export const AddUser = ({ ...props }) => {
  const [input, setInput] = React.useState("");
  const [searchUsers, setSearchUsers] = React.useState<User[]>([]);
  const handleConfirm = () => {
    if (props.client != null) {
      props.client.publish({
        destination: "/app/chat.addUser/" + props.currentGroup?.groupId,
        body: JSON.stringify({
          token: props.token,
          content: input,
          status: "ANNOUNCE",
        }),
      });
    }
  };
  const handleSearch = (input: string) => {
    if (input) {
      setInput(input);
      UserService.searchUser(input).then((res) => setSearchUsers(res));
    }
  };
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="border-collapse rounded-full w-11">
          <Plus className="w-full" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter User Email/ Name:</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <Input
            id="email"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) handleSearch(e.target.value);
              else {
                setInput("");
                setSearchUsers([]);
              }
            }}
          />
          <div className="absolute bg-gray-50 rounded-lg md:w-[300px] lg:w-[300px]">
            {searchUsers?.map((user) => (
              <div
                key={user.userId}
                className="flex items-center p-2 space-x-2 hover:bg-gray-200 hover:rounded-lg"
                onClick={() => {
                  setSearchUsers([]);
                  setInput(user.email);
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
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={handleConfirm}>
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
