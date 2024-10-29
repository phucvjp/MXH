import NotificationService, { Notifi } from "@/service/NotificationService";
import { useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import NotificationItem from "./NotiItem";

export const Notification = ({ ...props }) => {
  const [notifications, setNotifications] = useState<Notifi[]>([]);

  const { isLoading, isPending, isError, data, error } = useQuery({
    queryKey: ["notis", props.user],
    queryFn: () => NotificationService.getNotifications(),
    retry: 1,
    retryOnMount: false,
  });

  useEffect(() => {
    if (data) setNotifications(data.content);
  }, [data]);

  useEffect(() => {
    if (props.newNoti) {
      setNotifications([props.newNoti, ...(notifications || [])]);
    }
  }, [props.newNoti]);

  if (isLoading || isPending)
    return (
      <div className="w-full h-8">
        <div className="animate-pulse bg-gray-200 h-full w-full"></div>
      </div>
    );

  if (isError) return <div>{error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-4 min-w-72">
      <h2 className="text-2xl font-bold mb-4 text-center">Notifications</h2>
      <div className="bg-white overflow-hidden ">
        {notifications.map((noti) => (
          <NotificationItem key={noti.id} noti={noti} />
        ))}
      </div>
    </div>
  );
};
