import { useCallback } from "react"

import { useFetch } from "@/hooks/useFetch"

const useApiService = () => {
  const fetchService = useFetch()

  // const getModels = useCallback(
  // 	(
  // 		params: GetManagementRoutineInstanceDetailedParams,
  // 		signal?: AbortSignal
  // 	) => {
  // 		return fetchService.get<GetManagementRoutineInstanceDetailed>(
  // 			`/v1/ManagementRoutines/${params.managementRoutineId}/instances/${params.instanceId
  // 			}?sensorGroupIds=${params.sensorGroupId ?? ''}`,
  // 			{
  // 				signal,
  // 			}
  // 		);
  // 	},
  // 	[fetchService]
  // );

  const getModels = useCallback(
    (params, signal) => {
      return fetchService.post(`/api/models`, {
        body: { key: params.key },
        headers: {
          "Content-Type": "application/json"
        },
        signal
      })
    },
    [fetchService]
  )

  return {
    getModels
  }
}

export default useApiService
