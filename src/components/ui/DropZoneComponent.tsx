import { UploadCloudIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller } from "react-hook-form";

interface AcceptedFile extends File {
  preview: string;
}

import { Control } from "react-hook-form"; // Add this import

interface DropzoneComponentProps {
  control: Control<any>;
  name: string;
  maxFiles?: number;
  fieldMessage?: string;
  submited: boolean;
}

export default function DropzoneComponent({
  control,
  name,
  maxFiles = 5,
  fieldMessage = "Drag 'n' drop some images here, or click to select images",
  submited,
}: DropzoneComponentProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => {
        const [acceptedFiles, setAcceptedFiles] = useState<AcceptedFile[]>([]); // Explicit typing
        const { getRootProps, getInputProps } = useDropzone({
          accept: { "image/*": [] },
          onDrop: (newAcceptedFiles) => {
            console.log(newAcceptedFiles);
            // Rename to clarify the new files
            setAcceptedFiles((prevAcceptedFiles) => [
              ...prevAcceptedFiles, // Keep the existing files
              ...newAcceptedFiles.map((file) =>
                Object.assign(file, { preview: URL.createObjectURL(file) })
              ),
            ]);
          },
        });

        useEffect(() => {
          setAcceptedFiles([]);
        }, [submited]);
        const removeFile = (fileToRemove: AcceptedFile) => {
          setAcceptedFiles((prevFiles) =>
            prevFiles.filter((file) => file !== fileToRemove)
          );
          console.log(acceptedFiles);
        };

        useEffect(() => {
          onChange(acceptedFiles);
        }, [acceptedFiles]);

        const acceptedFileItems = acceptedFiles.map((file, i) => (
          <div
            key={i}
            className="flex flex-row gap-2 w-full justify-between relative m-1"
          >
            {/* Display image preview */}
            <img
              src={file.preview}
              alt={file.name}
              className="basis 1/3 w-[200px] justify-between rounded-md"
            />
            {/* <div className="w-full flex flex-row justify-between">
              <div className="basis-11/12">
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>{file.path} </p>
              </div>
              <div className=" flex justify-end items-top">
                <X className="hover:cursor-pointer " onClick={() => removeFile(file)} />
              </div>
            </div> */}
            <div
              onClick={() => removeFile(file)}
              className="absolute top-1 right-1 rounded-full bg-orange-100 hover:bg-accent-dark w-6 h-6 flex justify-center items-center hover:cursor-pointer"
            >
              <X className="text-foreground h-3 w-3" />
            </div>
          </div>
        ));

        return (
          <>
            <section
              className={`container min-h-[100px] flex justify-start items-center flex-row overflow-x-auto gap-2 h-max`}
            >
              {acceptedFileItems.length > maxFiles && (
                <p className="text-sm text-destructive">
                  {acceptedFileItems.length}/{maxFiles} files selected
                </p>
              )}
              {acceptedFileItems.length < maxFiles && (
                <div
                  className={`${
                    acceptedFileItems.length > 0 ? "w-[100px]" : "w-full"
                  } dropzone flex justify-center items-center border rounded-xl  border-dotted h-[100px] hover:cursor-pointer hover:bg-accent`}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <div className="w-full flex justify-center items-center gap-2">
                    <UploadCloudIcon />
                    <p> {acceptedFileItems.length > 0 ? "" : fieldMessage}</p>
                  </div>
                </div>
              )}
              <div className=" flex overflow-x-auto">{acceptedFileItems}</div>
            </section>
          </>
        );
      }}
    />
  );
}
