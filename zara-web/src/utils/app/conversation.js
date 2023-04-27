export const updateConversation = (updatedConversation, allConversations) => {
  const updatedConversations = allConversations.map(c => {
    if (c.id === updatedConversation.id) {
      return updatedConversation
    }

    return c
  })

  saveConversation(updatedConversation)
  saveConversations(updatedConversations)

  return {
    single: updatedConversation,
    all: updatedConversations
  }
}

export const saveConversation = conversation => {
  localStorage.setItem("selectedConversation", JSON.stringify(conversation))
}

export const saveConversations = conversations => {
  localStorage.setItem("conversationHistory", JSON.stringify(conversations))
}
