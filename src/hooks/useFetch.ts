import { useEffect, useState } from 'react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type UseFetchResult<T> = {
	data: T | null
	loading: boolean
	error: string | null
	refetch: () => void
}

export function useFetch<T>(
	url: string | null,
	method: HttpMethod = 'GET',
	body?: unknown,
): UseFetchResult<T> {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [reloadKey, setReloadKey] = useState(0)

	const serializedBody = JSON.stringify(body ?? null)

	useEffect(() => {
		if (!url) {
			return
		}

		const controller = new AbortController()

		const fetchData = async () => {
			setLoading(true)
			setError(null)

			try {
				const response = await fetch(url, {
					method,
					headers: body ? { 'Content-Type': 'application/json' } : undefined,
					body: body ? JSON.stringify(body) : undefined,
					signal: controller.signal,
				})

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`)
				}

				if (response.status === 204) {
					setData(null)
					return
				}

				const result = (await response.json()) as T
				setData(result)
			} catch (caughtError) {
				if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
					return
				}

				setError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
			} finally {
				setLoading(false)
			}
		}

		void fetchData()

		return () => {
			controller.abort()
		}
	}, [body, method, reloadKey, serializedBody, url])

	const refetch = () => {
		setReloadKey((currentValue) => currentValue + 1)
	}

	return {
		data,
		loading,
		error,
		refetch,
	}
}
