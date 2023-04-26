import { useContext } from "react"

import HomeContext from "@/pages/api/home/home.context"

import Folder from "@/components/Folder"

import { ConversationComponent } from "./Conversation"

export const ChatFolders = ({ searchTerm }) => {
  const {
    state: { folders, conversations },
    handleUpdateConversation
  } = useContext(HomeContext)

  const handleDrop = (e, folder) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData("conversation"))
      handleUpdateConversation(conversation, {
        key: "folderId",
        value: folder.id
      })
    }
  }

  const ChatFolders = currentFolder => {
    return (
      conversations &&
      conversations
        .filter(conversation => conversation.folderId)
        .map((conversation, index) => {
          if (conversation.folderId === currentFolder.id) {
            return (
              <div key={index} className="ml-5 gap-2 border-l pl-2">
                <ConversationComponent conversation={conversation} />
              </div>
            )
          }
        })
    )
  }

  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter(folder => folder.type === "chat")
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={ChatFolders(folder)}
          />
        ))}
    </div>
  )
}

