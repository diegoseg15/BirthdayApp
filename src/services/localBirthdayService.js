// src/services/localBirthdayService.js

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  cancelBirthdayReminder,
  scheduleBirthdayReminder,
} from "./notificationService";

const LOCAL_BIRTHDAYS_KEY = "rimind:local_birthdays:v1";

export const LOCAL_REMINDER_STATUS = {
  SCHEDULED: "scheduled",
  DISABLED: "disabled",
  UNAVAILABLE: "unavailable",
};

const listeners = new Set();

function createId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function serializeBirthday(birthday) {
  const dateBirth =
    birthday.dateBirth instanceof Date
      ? birthday.dateBirth.toISOString()
      : birthday.dateBirth;

  return {
    ...birthday,
    dateBirth,
  };
}

function normalizeBirthday(birthday) {
  return {
    ...birthday,
    dateBirth: birthday.dateBirth ? new Date(birthday.dateBirth) : null,
  };
}

function sortBirthdays(birthdays) {
  return [...birthdays].sort((a, b) => {
    const monthA = Number(a.birthMonth || 0);
    const monthB = Number(b.birthMonth || 0);
    const dayA = Number(a.birthDay || 0);
    const dayB = Number(b.birthDay || 0);

    if (monthA !== monthB) return monthA - monthB;

    return dayA - dayB;
  });
}

async function readBirthdays() {
  const rawValue = await AsyncStorage.getItem(LOCAL_BIRTHDAYS_KEY);

  if (!rawValue) return [];

  try {
    const parsedBirthdays = JSON.parse(rawValue);

    if (!Array.isArray(parsedBirthdays)) return [];

    return parsedBirthdays.map(normalizeBirthday);
  } catch {
    return [];
  }
}

async function writeBirthdays(birthdays) {
  const serializedBirthdays = birthdays.map(serializeBirthday);

  await AsyncStorage.setItem(
    LOCAL_BIRTHDAYS_KEY,
    JSON.stringify(serializedBirthdays),
  );

  notifyListeners();
}

async function notifyListeners() {
  const birthdays = sortBirthdays(await readBirthdays());

  listeners.forEach((callback) => {
    callback(birthdays);
  });
}

function getReminderStatus(notificationId, notificationsEnabled) {
  if (!notificationsEnabled) return LOCAL_REMINDER_STATUS.DISABLED;
  if (notificationId) return LOCAL_REMINDER_STATUS.SCHEDULED;

  return LOCAL_REMINDER_STATUS.UNAVAILABLE;
}

async function safeScheduleBirthdayReminder({
  birthdayId,
  name,
  lastname,
  dateBirth,
}) {
  try {
    return await scheduleBirthdayReminder({
      birthdayId,
      name,
      lastname,
      dateBirth,
    });
  } catch (error) {
    console.warn("Local birthday reminder could not be scheduled:", error);
    return null;
  }
}

export async function getLocalBirthdays() {
  return sortBirthdays(await readBirthdays());
}

export async function clearLocalBirthdays() {
  await AsyncStorage.removeItem(LOCAL_BIRTHDAYS_KEY);
  notifyListeners();
}

export function listenLocalBirthdays(callback, onError) {
  listeners.add(callback);

  getLocalBirthdays()
    .then(callback)
    .catch(() => {
      if (onError) {
        onError();
      }
    });

  return () => {
    listeners.delete(callback);
  };
}

export async function createLocalBirthday(
  birthdayData,
  options = { notificationsEnabled: true },
) {
  const cleanName = birthdayData.name.trim();
  const cleanLastname = birthdayData.lastname.trim();
  const hasBirthYear = Boolean(birthdayData.hasBirthYear);
  const dateBirth = birthdayData.dateBirth;

  const birthday = {
    id: createId(),
    name: cleanName,
    lastname: cleanLastname,
    dateBirth,
    birthDay: dateBirth.getDate(),
    birthMonth: dateBirth.getMonth() + 1,
    birthYear: hasBirthYear ? dateBirth.getFullYear() : null,
    hasBirthYear,
    notificationId: null,
    reminderStatus: options.notificationsEnabled
      ? LOCAL_REMINDER_STATUS.UNAVAILABLE
      : LOCAL_REMINDER_STATUS.DISABLED,
    source: "local",
    synced: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (options.notificationsEnabled) {
    const notificationId = await safeScheduleBirthdayReminder({
      birthdayId: birthday.id,
      name: cleanName,
      lastname: cleanLastname,
      dateBirth,
    });

    birthday.notificationId = notificationId || null;
    birthday.reminderStatus = getReminderStatus(
      notificationId,
      options.notificationsEnabled,
    );
  }

  const birthdays = await readBirthdays();

  await writeBirthdays([...birthdays, birthday]);

  return birthday;
}

export async function updateLocalBirthday(
  birthdayId,
  birthdayData,
  options = { notificationsEnabled: true, currentNotificationId: null },
) {
  const birthdays = await readBirthdays();

  const currentBirthday = birthdays.find(
    (birthday) => birthday.id === birthdayId,
  );

  if (!currentBirthday) {
    throw new Error("Local birthday not found.");
  }

  if (options.currentNotificationId) {
    await cancelBirthdayReminder(options.currentNotificationId);
  }

  const cleanName = birthdayData.name.trim();
  const cleanLastname = birthdayData.lastname.trim();
  const hasBirthYear = Boolean(birthdayData.hasBirthYear);
  const dateBirth = birthdayData.dateBirth;

  let notificationId = null;

  if (options.notificationsEnabled) {
    notificationId = await safeScheduleBirthdayReminder({
      birthdayId,
      name: cleanName,
      lastname: cleanLastname,
      dateBirth,
    });
  }

  const updatedBirthday = {
    ...currentBirthday,
    name: cleanName,
    lastname: cleanLastname,
    dateBirth,
    birthDay: dateBirth.getDate(),
    birthMonth: dateBirth.getMonth() + 1,
    birthYear: hasBirthYear ? dateBirth.getFullYear() : null,
    hasBirthYear,
    notificationId: notificationId || null,
    reminderStatus: getReminderStatus(
      notificationId,
      options.notificationsEnabled,
    ),
    synced: false,
    updatedAt: new Date().toISOString(),
  };

  const nextBirthdays = birthdays.map((birthday) =>
    birthday.id === birthdayId ? updatedBirthday : birthday,
  );

  await writeBirthdays(nextBirthdays);

  return updatedBirthday;
}

export async function removeLocalBirthday(birthdayId, notificationId) {
  await cancelBirthdayReminder(notificationId);

  const birthdays = await readBirthdays();
  const nextBirthdays = birthdays.filter(
    (birthday) => birthday.id !== birthdayId,
  );

  await writeBirthdays(nextBirthdays);
}

export async function enableLocalBirthdayReminders() {
  const birthdays = await readBirthdays();
  let enabled = 0;

  const nextBirthdays = [];

  for (const birthday of birthdays) {
    if (birthday.notificationId) {
      nextBirthdays.push(birthday);
      continue;
    }

    const notificationId = await safeScheduleBirthdayReminder({
      birthdayId: birthday.id,
      name: birthday.name,
      lastname: birthday.lastname,
      dateBirth: birthday.dateBirth,
    });

    nextBirthdays.push({
      ...birthday,
      notificationId: notificationId || null,
      reminderStatus: notificationId
        ? LOCAL_REMINDER_STATUS.SCHEDULED
        : LOCAL_REMINDER_STATUS.UNAVAILABLE,
      updatedAt: new Date().toISOString(),
    });

    enabled += 1;
  }

  await writeBirthdays(nextBirthdays);

  return enabled;
}

export async function disableLocalBirthdayReminders() {
  const birthdays = await readBirthdays();

  for (const birthday of birthdays) {
    if (birthday.notificationId) {
      await cancelBirthdayReminder(birthday.notificationId);
    }
  }

  const nextBirthdays = birthdays.map((birthday) => ({
    ...birthday,
    notificationId: null,
    reminderStatus: LOCAL_REMINDER_STATUS.DISABLED,
    updatedAt: new Date().toISOString(),
  }));

  await writeBirthdays(nextBirthdays);

  return nextBirthdays.length;
}
