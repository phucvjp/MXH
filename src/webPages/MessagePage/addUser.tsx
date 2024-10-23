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
import { DialogClose } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import React from "react";

export const AddUser = ({ ...props }) => {
  const [input, setInput] = React.useState("");
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
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="border-collapse rounded-full w-11">
          <Plus className="w-full" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter User Email:</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Input id="email" onChange={(e) => setInput(e.target.value)} />

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
