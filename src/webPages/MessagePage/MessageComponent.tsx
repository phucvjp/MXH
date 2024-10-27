import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BACK_END } from "@/constant/domain";
import { Attachment } from "@/service/AttachmentService";
import useRealTime from "@/service/useRealtime";
import { LazyLoadImage } from "react-lazy-load-image-component";

export const MessageComponent = ({ ...props }) => {
  const formattedTime = useRealTime(props.msg?.updateAt, "formatMessageTime");

  if (props.msg?.status === "MESSAGE")
    return (
      <>
        <div
          className={`flex mb-4 items-start  ${
            props.msg?.user?.userId === props.user?.userId
              ? "justify-end"
              : "justify-start"
          }`}
        >
          {props.msg?.user.userId === props.user?.userId ? null : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar
                    onClick={() => {
                      props.handleViewPro(props.msg?.user.userId);
                    }}
                    className="h-8 w-8 mr-2 hover:cursor-pointer"
                  >
                    {!props.msg?.user?.avatar ? null : (
                      <AvatarImage
                        src={`${BACK_END}/attachment/${props.msg?.user?.avatar}`}
                        alt={props.msg?.user?.firstName}
                      />
                    )}

                    <AvatarFallback className="bg-white">
                      {(props.msg?.user?.firstName || "")
                        .slice(0, 1)
                        .toUpperCase() +
                        (props.msg?.user?.lastName || "")
                          .slice(0, 1)
                          .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {(props.msg?.user?.firstName || "") +
                      " " +
                      (props.msg?.user?.lastName || "")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div
            className={`max-w-[65%] rounded-2xl  ${
              props.msg?.user?.userId === props.user?.userId
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full hover:cursor-default p-2">
                  <p className="break-words text-left ">{props.msg?.content}</p>
                  <div className="flex items-center flex-wrap justify-center w-fit">
                    {props.msg?.attachments?.map(
                      (attachment: Attachment, index: number) => (
                        <div key={index} className="flex m-1">
                          <LazyLoadImage
                            src={`${BACK_END}/attachment/${attachment.name}`}
                            alt={`${attachment.name}`}
                            className="h-28 w-28 object-cover rounded-lg hover:cursor-pointer"
                            loading="lazy"
                            onClick={() => {
                              window.open(
                                `${BACK_END}/attachment/${attachment.name}`
                              );
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formattedTime}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </>
    );
  if (props.msg?.status === "ANNOUNCE") {
    return (
      <>
        <div className="flex justify-center mb-4">
          <p>{formattedTime}</p>
        </div>
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-gray-300 rounded-lg max-w-fit">
            <p>{props.msg?.content}</p>
          </div>
        </div>
      </>
    );
  }
};
