// src/utils/validation.js

export function validateEmail(email) {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
}

export function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
