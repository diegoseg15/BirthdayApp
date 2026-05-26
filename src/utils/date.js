// src/utils/date.js

export function formatDate(dateValue, options = {}) {
  const date = getDateFromFirestoreValue(dateValue);

  if (!date) return "Fecha no disponible";

  const hasBirthYear = options.hasBirthYear ?? true;

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "long",
    ...(hasBirthYear ? { year: "numeric" } : {}),
  }).format(date);
}

export function getDateFromFirestoreValue(dateValue) {
  if (!dateValue) return null;

  if (dateValue?.toDate) {
    return dateValue.toDate();
  }

  if (dateValue instanceof Date) {
    return dateValue;
  }

  return null;
}

export function getNextBirthdayInfo(dateValue, birthday = {}) {
  const fallbackDate = getDateFromFirestoreValue(dateValue);

  const month = birthday.birthMonth || (fallbackDate?.getMonth() ?? null) + 1;
  const day = birthday.birthDay || fallbackDate?.getDate();

  if (!month || !day) {
    return {
      daysLeft: null,
      label: "Sin fecha",
    };
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  const nextBirthday = new Date(currentYear, month - 1, day);

  today.setHours(0, 0, 0, 0);
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.round((nextBirthday - today) / millisecondsPerDay);

  if (daysLeft === 0) {
    return {
      daysLeft,
      label: "Hoy es su cumpleaños",
    };
  }

  if (daysLeft === 1) {
    return {
      daysLeft,
      label: "Falta 1 día",
    };
  }

  return {
    daysLeft,
    label: `Faltan ${daysLeft} días`,
  };
}
