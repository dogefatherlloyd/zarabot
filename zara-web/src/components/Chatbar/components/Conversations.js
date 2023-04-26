import { ConversationComponent } from "./Conversation"

export const Conversations = ({ conversations }) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {conversations
        .filter(conversation => !conversation.folderId)
        .slice()
        .reverse()
        .map((conversation, index) => (
          <ConversationComponent key={index} conversation={conversation} />
        ))}
    </div>
  )
}
