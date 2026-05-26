// src/utils/date.js

export function formatDate(dateValue) {
  const date = getDateFromFirestoreValue(dateValue);

  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
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

export function getNextBirthdayInfo(dateValue) {
  const birthDate = getDateFromFirestoreValue(dateValue);

  if (!birthDate) {
    return {
      daysLeft: null,
      label: "Sin fecha",
    };
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  const nextBirthday = new Date(
    currentYear,
    birthDate.getMonth(),
    birthDate.getDate(),
  );

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
