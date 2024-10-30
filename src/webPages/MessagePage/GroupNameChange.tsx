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
import GroupService, { Group } from "@/service/GroupService";
import { DialogClose } from "@radix-ui/react-dialog";
import { Edit } from "lucide-react";
import React from "react";

export const GroupNameChange = ({ ...props }) => {
  const [input, setInput] = React.useState("");
  const handleConfirm = () => {
    GroupService.changeName(props.group?.groupId, input).then((group) => {
      props.dispatch(
        props.setGroups(
          props.groups.map((g: Group) => {
            if (g.groupId === group.groupId) {
              return group;
            }
            return g;
          })
        )
      );
      props.dispatch(props.setCurrentGroup(group));
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="border-collapse rounded-full w-11" variant={"ghost"}>
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Group Name:</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Input
          id="name"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder={props.group?.name}
        />
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
