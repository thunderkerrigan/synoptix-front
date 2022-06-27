import axios from 'axios'
import { useCallback, useState } from 'react'

export const useGetRequest = <T>(
    url: string
): [T | undefined, (arg?: string) => Promise<void>, boolean] => {
    const [URL] = useState(url)

    const [response, setResponse] = useState<T>()

    const [isLoading, setIsLoading] = useState(false)
    const fetch = useCallback(() => {
        const fetchRequest = async (arg: string = ''): Promise<void> => {
            try {
                setIsLoading(true)
                const response = await axios.get<T>(`${URL}${arg}`, {
                    timeout: 15 * 1000,
                })
                if (response.status === 200) {
                    setResponse(response.data)
                }
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
            }
        }
        return fetchRequest()
    }, [URL])

    return [response, fetch, isLoading]
}
