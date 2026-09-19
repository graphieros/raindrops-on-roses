import { useMainStore } from '../src/stores/main'

export type FetchParams<T> = {
  url: string
  _then?: (data: T) => unknown
  _finally?: () => void
  _onError?: (error: unknown) => void
}

export default async function useFetch<T>({
  url,
  _then = () => {},
  _finally = () => {},
  _onError = () => {},
}: FetchParams<T>) {
  const store = useMainStore()

  store.isFetching = true

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      return response.json() as Promise<T>
    })
    .then(_then)
    .catch((error: unknown) => {
      console.error('There was a problem fetching data:', error)
      _onError(error)
    })
    .finally(() => {
      store.isFetching = false
      _finally()
    })
}
