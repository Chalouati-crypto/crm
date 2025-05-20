import bcrypt from "bcryptjs";
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
export async function saltAndHashPassword(pwd: string, rounds: number = 10) {
  const hashedPassword = await bcrypt.hash(pwd, rounds);
  return hashedPassword;
}
