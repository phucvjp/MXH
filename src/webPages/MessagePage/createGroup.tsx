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
import GroupService from "@/service/GroupService";
import { DialogClose } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import React from "react";

export const CreateGroup = ({ ...props }) => {
  const [input, setInput] = React.useState("");
  const handleConfirm = () => {
    GroupService.createGroup(input).then((group) => {
      props.dispatch(props.setGroups([group, ...props.groups]));
      props.setAddNewGroup((prev: boolean) => !prev);
    });
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
          <DialogTitle>Enter Group Name:</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Input
          id="email"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={handleConfirm}>
              Create
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
