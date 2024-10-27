import { useEffect, useState } from "react";
import { DateUtil } from "../service/DateUtil";

const useRealTime = (
  time: string,
  formatFunction: "formatPostTime" | "formatMessageTime"
) => {
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    const updateFormattedTime = () => {
      const dateUtil = new DateUtil(time);
      setFormattedTime(dateUtil[formatFunction]());
    };

    updateFormattedTime();
    const intervalId = setInterval(updateFormattedTime, 1000);

    return () => clearInterval(intervalId);
  }, [time, formatFunction]);

  return formattedTime;
};

export default useRealTime;
