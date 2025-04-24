import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDateLocal = (datetime) => {
  if (!(datetime instanceof Date) || isNaN(datetime)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${datetime.getFullYear()}-${pad(datetime.getMonth() + 1)}-${pad(
    datetime.getDate()
  )}T${pad(datetime.getHours())}:${pad(datetime.getMinutes())}`;
};
