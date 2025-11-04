import { LoginProps } from "@/types";
import axios from "axios";

export const login = async ({email, pass}:LoginProps) => {
  const response = await axios.post(`/api/users`,{
    email,
    pass
  });
  return response.data
};
