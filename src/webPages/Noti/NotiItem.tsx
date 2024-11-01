import { formatDistanceToNow } from "date-fns";
import {
  CheckCircleIcon,
  BellIcon,
  MessageSquareIcon,
  UserPlusIcon,
  ThumbsUp,
} from "lucide-react";
import { Notifi, NotifiType } from "@/service/NotificationService";
import { useNavigate } from "react-router-dom";

const NotificationItem = ({ noti }: { noti: Notifi }) => {
  const nav = useNavigate();
  const getIcon = (type: NotifiType) => {
    switch (type) {
      case "COMMENT":
        return <MessageSquareIcon className="text-blue-500" />;
      case "LIKE":
        return <ThumbsUp className="text-lime-400" />;
      case "SHARE":
        return <BellIcon className="text-pink-500" />;
      case "POST":
        return <BellIcon className="text-yellow-500" />;
      case "FRIEND_ACCEPTED":
        return <UserPlusIcon className="text-purple-500" />;
      case "SYSTEM":
        return <CheckCircleIcon className="text-gray-500" />;
      default:
        return <BellIcon className="text-gray-500" />;
    }
  };

  return (
    <div
      key={noti.id}
      className={`block items-center justify-between p-4 border-b ${
        noti.isRead ? "bg-white" : "bg-slate-200"
      } hover:bg-slate-100 transition-colors duration-200 hover:cursor-pointer rounded-lg m-2 shadow-md`}
      onClick={() => {
        nav(noti.link);
      }}
    >
        <div className="w-full font-semibold flex truncate">
          {getIcon(noti.type)}
          {noti.title}
        </div>
        <div className="w-full">{noti.content}</div>
        <div className="w-full text-gray-500 text-sm">
          {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true })}
        </div>
    </div>
  );
};

export default NotificationItem;
