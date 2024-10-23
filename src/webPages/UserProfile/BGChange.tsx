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
import UserService from "@/service/UserService";
import { CameraIcon } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const BGChange = ({ ...props }) => {
  const [BGPreview, setBGPreview] = useState<string | null>(props.bGPreview);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    setBGPreview(props.bGPreview);
  }, [props.bGPreview]);

  const uploadBG = async () => {
    if (!image) {
      toast.error("Please select an image to upload");
      return;
    }
    UserService.uploadBG(image)
      .then((res) => {
        if (res) {
          toast.success("Background uploaded successfully");
          console.log(res);
          props.setBGPreview(`${BACK_END}/attachment/${res?.name}`);
          setBGPreview(`${BACK_END}/attachment/${res?.name}`);
        }
      })
      .catch((error) => {
        toast.error("Failed to upload bG");
      });
  };
  const handleBGChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBGPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="absolute bg-black bg-opacity-50 w-fit bottom-4 right-4">
          <CameraIcon className="w-6 h-6 mr-1 text-white" />
          Change Background
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>Edit BG</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadBG();
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center">
              <div className=" rounded-lg border-white hover:cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-black translate-y-3/4 bg-opacity-50 ">
                  <CameraIcon className="w-6 h-6 m-auto text-white" />
                </div>
                <img
                  src={BGPreview || props.bGPreview}
                  alt="Cover"
                  className="w-full object-contain rounded-lg aspect-[5/1] bg-current"
                />
                <Input
                  id="bG"
                  type="file"
                  accept="image/*"
                  onChange={handleBGChange}
                  required
                  className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                />
              </div>
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
