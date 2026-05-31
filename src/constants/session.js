// src/constants/session.js

export const LOCAL_USER_ID = "local-user";

export const LOCAL_USER = {
  uid: LOCAL_USER_ID,
  email: "Local mode",
  isLocal: true,
};

export function isLocalUser(user) {
  return Boolean(user?.isLocal || user?.uid === LOCAL_USER_ID);
}

export function isLocalUserId(userId) {
  return userId === LOCAL_USER_ID;
}
