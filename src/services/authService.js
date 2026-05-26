// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../utils/firebase";
import { normalizeEmail } from "../utils/validation";

export function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithEmail({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  return signInWithEmailAndPassword(auth, normalizedEmail, password);
}

export async function registerWithEmail({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  return createUserWithEmailAndPassword(auth, normalizedEmail, password);
}

export async function logout() {
  return signOut(auth);
}
