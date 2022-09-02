export const hidePhoneNumber = (phoneNumber:string) => {
  return phoneNumber.slice(0,3) + "****" + phoneNumber.slice(7,11)
}