export const updatePrompt = (updatedPrompt, allPrompts) => {
  const updatedPrompts = allPrompts.map(c => {
    if (c.id === updatedPrompt.id) {
      return updatedPrompt
    }

    return c
  })

  savePrompts(updatedPrompts)

  return {
    single: updatedPrompt,
    all: updatedPrompts
  }
}

export const savePrompts = prompts => {
  localStorage.setItem("prompts", JSON.stringify(prompts))
}
