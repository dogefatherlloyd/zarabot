const STORAGE_KEY = "settings"

export const getSettings = () => {
  let settings = {
    theme: "dark"
  }
  const settingsJson = localStorage.getItem(STORAGE_KEY)
  if (settingsJson) {
    try {
      let savedSettings = JSON.parse(settingsJson)
      settings = Object.assign(settings, savedSettings)
    } catch (e) {
      console.error(e)
    }
  }
  return settings
}

export const saveSettings = settings => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
