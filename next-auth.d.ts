import { type DefaultSession } from "next-auth";

export type ExtendUser = DefaultSession["user"] & {
  id: string;
  role: string;
  image: string;
  role: string;
  email: string;
  name: string;
  userId: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string;
  }
}
