import axios from "axios";
import { useState } from "react";

export const useGetRequest = <T>(
  url: string
): [T | undefined, (arg?: string) => Promise<void>, boolean] => {
  const [URL] = useState(url);
  const [response, setResponse] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);
  const fetch = async (arg: string = ""): Promise<void> => {
    setIsLoading(true);
    const response = await axios.get<T>(`${URL}${arg}`);
    if (response.status === 200) {
      setResponse(response.data);
    }
    setIsLoading(false);
  };

  return [response, fetch, isLoading];
};
