export const GenNonDuplicateID = () => {
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substr(3)
  return idStr
}