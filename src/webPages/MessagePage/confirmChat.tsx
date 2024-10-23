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
import GroupService, { Group } from "@/service/GroupService";
import { DialogClose } from "@radix-ui/react-dialog";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ConfirmChat = ({ ...props }) => {
  const nav = useNavigate();
  console.log(props.group, props.user);
  const createChat = async (group: Group) => {
    GroupService.createChat(
      group,
      group.users.filter((user1) => {
        return user1.userId !== props.user?.userId;
      })[0].userId
    ).then((response) => {
      console.log(response);
      nav(`/messages`, {
        state: {
          tempChat: response,
        },
      });
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button className="w-full">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Chat</DialogTitle>
          <DialogDescription>
            Are you sure you want to chat with this user?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">No</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={() => createChat(props.group)}>
              Yes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
