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
import GroupService from "@/service/GroupService";
import { CameraIcon } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const GroupAvatarChange = ({ ...props }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    props.avatarPreview
  );
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    setAvatarPreview(props.avatarPreview);
  }, [props.avatarPreview]);

  const uploadAvatar = async () => {
    if (!image) {
      toast.error("Please select an image to upload");
      return;
    }
    GroupService.uploadAvatar(image, props.group?.groupId)
      .then((res) => {
        if (res) {
          toast.success("Avatar uploaded successfully");
          props.setAvatarPreview(`${BACK_END}/attachment/${res?.name}`);
          setAvatarPreview(`${BACK_END}/attachment/${res?.name}`);
        }
      })
      .catch(() => {
        toast.error("Failed to upload avatar");
      });
  };
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar className="sm:h-24 sm:w-24 md:h-32 md:w-32 border-4 border-white hover:cursor-pointer">
          <div className="absolute inset-0 bg-black translate-y-3/4 bg-opacity-50 ">
            <CameraIcon className="w-6 h-6 m-auto text-white" />
          </div>
          <AvatarImage src={props.avatarPreview || ""} alt="avatar" />
          <AvatarFallback>{props.group?.name}</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group Avatar</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadAvatar();
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center">
              <Avatar className="w-40 h-40 border-4 border-white hover:cursor-pointer">
                <div className="absolute inset-0 bg-black translate-y-3/4 bg-opacity-50 ">
                  <CameraIcon className="w-6 h-6 m-auto text-white" />
                </div>
                <AvatarImage src={avatarPreview || ""} alt="avatar" />
                <AvatarFallback>{props.group?.name}</AvatarFallback>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  required
                  className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                />
              </Avatar>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
