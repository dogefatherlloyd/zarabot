export const useFetch = () => {
  const handleFetch = async (url, request, signal) => {
    const requestUrl = request?.params ? `${url}${request.params}` : url

    const requestBody = request?.body
      ? request.body instanceof FormData
        ? { ...request, body: request.body }
        : { ...request, body: JSON.stringify(request.body) }
      : request

    const headers = {
      ...(request?.headers
        ? request.headers
        : request?.body && request.body instanceof FormData
        ? {}
        : { "Content-type": "application/json" })
    }

    return fetch(requestUrl, { ...requestBody, headers, signal })
      .then(response => {
        if (!response.ok) throw response

        const contentType = response.headers.get("content-type")
        const contentDisposition = response.headers.get("content-disposition")

        const headers = response.headers

        const result =
          contentType &&
          (contentType?.indexOf("application/json") !== -1 ||
            contentType?.indexOf("text/plain") !== -1)
            ? response.json()
            : contentDisposition?.indexOf("attachment") !== -1
            ? response.blob()
            : response

        return result
      })
      .catch(async err => {
        const contentType = err.headers.get("content-type")

        const errResult =
          contentType && contentType?.indexOf("application/problem+json") !== -1
            ? await err.json()
            : err

        throw errResult
      })
  }

  return {
    get: async (url, request) => {
      return handleFetch(url, { ...request, method: "get" })
    },
    post: async (url, request) => {
      return handleFetch(url, { ...request, method: "post" })
    },
    put: async (url, request) => {
      return handleFetch(url, { ...request, method: "put" })
    },
    patch: async (url, request) => {
      return handleFetch(url, { ...request, method: "patch" })
    },
    delete: async (url, request) => {
      return handleFetch(url, { ...request, method: "delete" })
    }
  }
}