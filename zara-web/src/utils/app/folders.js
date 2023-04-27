export const saveFolders = folders => {
  localStorage.setItem("folders", JSON.stringify(folders))
}
