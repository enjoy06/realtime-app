"use client";

import { FC } from "react";

interface Props {
  date: string | number | Date;
}

export const ClientDate: FC<Props> = ({ date }) => {
  const formatted = new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return <>{formatted || "Loading..."}</>;

};