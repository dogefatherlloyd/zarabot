import { useMemo } from "react"

import { useTranslation } from "next-i18next"

const useErrorService = () => {
  const { t } = useTranslation("chat")

  return {
    getModelsError: useMemo(
      () => error => {
        return !error
          ? null
          : {
              title: t("Error fetching models."),
              code: error.status || "unknown",

              messageLines: error.statusText
                ? [error.statusText]
                : [
                    t(
                      "Make sure your OpenAI API key is set in the bottom left of the sidebar."
                    ),
                    t(
                      "If you completed this step, OpenAI may be experiencing issues."
                    )
                  ]
            }
      },
      [t]
    )
  }
}

export default useErrorService
