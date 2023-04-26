import { IconFileImport } from "@tabler/icons-react"

import { useTranslation } from "next-i18next"

import { SidebarButton } from "../Sidebar/SidebarButton"

export const Import = ({ onImport }) => {
  const { t } = useTranslation("sidebar")
  return (
    <>
      <input
        id="import-file"
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json"
        onChange={e => {
          if (!e.target.files?.length) return

          const file = e.target.files[0]
          const reader = new FileReader()
          reader.onload = e => {
            let json = JSON.parse(e.target?.result)
            onImport(json)
          }
          reader.readAsText(file)
        }}
      />

      <SidebarButton
        text={t("Import data")}
        icon={<IconFileImport size={18} />}
        onClick={() => {
          const importFile = document.querySelector("#import-file")
          if (importFile) {
            importFile.click()
          }
        }}
      />
    </>
  )
}