import { cleanConversationHistory } from "./clean"

export function isExportFormatV1(obj) {
  return Array.isArray(obj)
}

export function isExportFormatV2(obj) {
  return !("version" in obj) && "folders" in obj && "history" in obj
}

export function isExportFormatV3(obj) {
  return obj.version === 3
}

export function isExportFormatV4(obj) {
  return obj.version === 4
}

export const isLatestExportFormat = isExportFormatV4

export function cleanData(data) {
  if (isExportFormatV1(data)) {
    return {
      version: 4,
      history: cleanConversationHistory(data),
      folders: [],
      prompts: []
    }
  }

  if (isExportFormatV2(data)) {
    return {
      version: 4,
      history: cleanConversationHistory(data.history || []),
      folders: (data.folders || []).map(chatFolder => ({
        id: chatFolder.id.toString(),
        name: chatFolder.name,
        type: "chat"
      })),
      prompts: []
    }
  }

  if (isExportFormatV3(data)) {
    return { ...data, version: 4, prompts: [] }
  }

  if (isExportFormatV4(data)) {
    return data
  }

  throw new Error("Unsupported data format")
}

function currentDate() {
  const date = new Date()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}-${day}`
}

export const exportData = () => {
  let history = localStorage.getItem("conversationHistory")
  let folders = localStorage.getItem("folders")
  let prompts = localStorage.getItem("prompts")

  if (history) {
    history = JSON.parse(history)
  }

  if (folders) {
    folders = JSON.parse(folders)
  }

  if (prompts) {
    prompts = JSON.parse(prompts)
  }

  const data = {
    version: 4,
    history: history || [],
    folders: folders || [],
    prompts: prompts || []
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.download = `chatbot_ui_history_${currentDate()}.json`
  link.href = url
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importData = data => {
  const { history, folders, prompts } = cleanData(data)

  const oldConversations = localStorage.getItem("conversationHistory")
  const oldConversationsParsed = oldConversations
    ? JSON.parse(oldConversations)
    : []

  const newHistory = [...oldConversationsParsed, ...history].filter(
    (conversation, index, self) =>
      index === self.findIndex(c => c.id === conversation.id)
  )
  localStorage.setItem("conversationHistory", JSON.stringify(newHistory))
  if (newHistory.length > 0) {
    localStorage.setItem(
      "selectedConversation",
      JSON.stringify(newHistory[newHistory.length - 1])
    )
  } else {
    localStorage.removeItem("selectedConversation")
  }

  const oldFolders = localStorage.getItem("folders")
  const oldFoldersParsed = oldFolders ? JSON.parse(oldFolders) : []
  const newFolders = [...oldFoldersParsed, ...folders].filter(
    (folder, index, self) => index === self.findIndex(f => f.id === folder.id)
  )
  localStorage.setItem("folders", JSON.stringify(newFolders))

  const oldPrompts = localStorage.getItem("prompts")
  const oldPromptsParsed = oldPrompts ? JSON.parse(oldPrompts) : []
  const newPrompts = [...oldPromptsParsed, ...prompts].filter(
    (prompt, index, self) => index === self.findIndex(p => p.id === prompt.id)
  )
  localStorage.setItem("prompts", JSON.stringify(newPrompts))

  return {
    version: 4,
    history: newHistory,
    folders: newFolders,
    prompts: newPrompts
  }
}
