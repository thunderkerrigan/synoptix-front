import axios from "axios";
import { useState } from "react";

export const usePostRequest = <T, U>(
  url: string
): [U | undefined, (body: T) => Promise<void>, boolean] => {
  const [URL] = useState(url);
  const [response, setResponse] = useState<U>();
  const [isLoading, setIsLoading] = useState(false);
  const fetch = async (body: T): Promise<void> => {
    setIsLoading(true);
    const response = await axios.post<U>(`${URL}`, body);
    if (response.status === 200) {
      setResponse(response.data);
    }
    setIsLoading(false);
  };

  return [response, fetch, isLoading];
};
