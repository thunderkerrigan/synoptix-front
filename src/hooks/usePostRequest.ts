import axios, { AxiosBasicCredentials, AxiosResponse } from "axios";
import { useState } from "react";

export const usePostRequest = <T, U>(
  url: string
): [U | undefined, (body: T, auth?: string) => Promise<void>, boolean] => {
  const [URL] = useState(url);
  const [response, setResponse] = useState<U>();
  const [isLoading, setIsLoading] = useState(false);
  const fetch = async (body: T, auth?: string): Promise<void> => {
    const request = (
      _auth: AxiosBasicCredentials | string | undefined
    ): Promise<AxiosResponse<U, any>> => {
      switch (typeof auth) {
        case "string":
          return axios.post<U>(URL, body, {
            timeout: 15 * 1000,
            headers: {
              Authorization: `Bearer ${_auth}`,
            },
          });

        case "object":
          return axios.post<U>(URL, body, {
            timeout: 15 * 1000,
            auth: _auth as AxiosBasicCredentials,
          });

        default:
          return axios.post<U>(URL, body, {
            timeout: 15 * 1000,
          });
      }
    };
    try {
      setIsLoading(true);
      const response = await request(auth);
      if (response.status === 200) {
        setResponse(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return [response, fetch, isLoading];
};
