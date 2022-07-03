import axios, { AxiosBasicCredentials, AxiosResponse } from "axios";
import { useCallback, useState } from "react";

type GetError = string | undefined;
export const useGetRequest = <T>(
  url: string
): [
  T | undefined,
  (
    args?: Record<string, any> | string,
    auth?: AxiosBasicCredentials | string
  ) => Promise<void>,
  boolean,
  GetError
] => {
  const [URL] = useState(url);

  const [response, setResponse] = useState<T>();

  const [error, setError] = useState<GetError>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useCallback(
    (
      args?: Record<string, any> | string,
      auth?: AxiosBasicCredentials | string
    ) => {
      const fetchRequest = async (
        _args: Record<string, any> | string,
        _auth: AxiosBasicCredentials | string | undefined
      ): Promise<void> => {
        const fetchWithargsString = async (
          args: string,
          auth?: unknown
        ): Promise<AxiosResponse<T, any>> => {
          switch (typeof auth) {
            case "string":
              return axios.get<T>(`${URL}${args}`, {
                timeout: 15 * 1000,
                headers: {
                  Authorization: `Bearer ${auth}`,
                },
              });
            case "object":
              return axios.get<T>(`${URL}${args}`, {
                timeout: 15 * 1000,
                auth: auth as AxiosBasicCredentials,
              });
            default:
              return axios.get<T>(`${URL}${args}`, {
                timeout: 15 * 1000,
              });
          }
        };

        const fetchWithargsObject = async (
          params: Record<string, unknown>,
          auth?: unknown
        ): Promise<AxiosResponse<T, any>> => {
          switch (typeof auth) {
            case "string":
              return axios.get<T>(`${URL}`, {
                timeout: 15 * 1000,
                params,
                headers: {
                  Authorization: `Bearer ${auth}`,
                },
              });
            case "object":
              return axios.get<T>(`${URL}`, {
                timeout: 15 * 1000,
                params,
                auth: auth as AxiosBasicCredentials,
              });
            default:
              return axios.get<T>(`${URL}`, {
                timeout: 15 * 1000,
                params,
              });
          }
        };
        try {
          setIsLoading(true);
          setError(undefined);
          let request;
          if (typeof _args === "string") {
            request = fetchWithargsString(_args, _auth);
          } else {
            request = fetchWithargsObject(_args, _auth);
          }
          const response = await request;
          if (response.status === 200) {
            setResponse(response.data);
          }
          if (response.status === 404) {
            setError("404");
          }
          if (response.status === 401) {
            setError("401");
          }

          setIsLoading(false);
        } catch (error) {
          setError("get Error" + URL);
          setIsLoading(false);
        }
      };
      return fetchRequest(args || {}, auth || undefined);
    },
    [URL]
  );

  return [response, fetch, isLoading, error];
};
