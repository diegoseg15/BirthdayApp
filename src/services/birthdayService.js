// src/services/birthdayService.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../utils/firebase";
import {
  cancelBirthdayReminder,
  scheduleBirthdayReminder,
} from "./notificationService";

const FALLBACK_BIRTH_YEAR = 2000;

export const REMINDER_STATUS = {
  SCHEDULED: "scheduled",
  DISABLED: "disabled",
  UNAVAILABLE: "unavailable",
};

function getBirthdaysCollection(userId) {
  return collection(db, "users", userId, "birthdays");
}

function getLegacyBirthdaysCollection(userId) {
  return collection(db, userId);
}

function normalizeBirthdayDate(date, hasBirthYear) {
  if (hasBirthYear) return date;

  return new Date(
    FALLBACK_BIRTH_YEAR,
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );
}

function getReminderStatus(notificationId, notificationsEnabled) {
  if (!notificationsEnabled) return REMINDER_STATUS.DISABLED;
  if (notificationId) return REMINDER_STATUS.SCHEDULED;

  return REMINDER_STATUS.UNAVAILABLE;
}

export function listenBirthdays(userId, callback, onError) {
  const birthdaysQuery = query(
    getBirthdaysCollection(userId),
    orderBy("dateBirth", "asc"),
  );

  return onSnapshot(
    birthdaysQuery,
    (snapshot) => {
      const birthdays = snapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      }));

      callback(birthdays);
    },
    onError,
  );
}

export async function migrateLegacyBirthdays(userId) {
  const legacySnapshot = await getDocs(getLegacyBirthdaysCollection(userId));

  if (legacySnapshot.empty) {
    return {
      migrated: 0,
      skipped: 0,
    };
  }

  const currentSnapshot = await getDocs(getBirthdaysCollection(userId));
  const currentBirthdayIds = new Set(
    currentSnapshot.docs.map((documentSnapshot) => documentSnapshot.id),
  );

  const batch = writeBatch(db);
  let migrated = 0;
  let skipped = 0;

  legacySnapshot.docs.forEach((legacyDocument) => {
    const legacyData = legacyDocument.data();

    const hasRequiredFields =
      legacyData.name && legacyData.lastname && legacyData.dateBirth;

    if (!hasRequiredFields || currentBirthdayIds.has(legacyDocument.id)) {
      skipped += 1;
      return;
    }

    const date = legacyData.dateBirth?.toDate
      ? legacyData.dateBirth.toDate()
      : null;

    const newBirthdayRef = doc(
      db,
      "users",
      userId,
      "birthdays",
      legacyDocument.id,
    );

    batch.set(
      newBirthdayRef,
      {
        name: legacyData.name,
        lastname: legacyData.lastname,
        dateBirth: legacyData.dateBirth,
        birthDay: date ? date.getDate() : null,
        birthMonth: date ? date.getMonth() + 1 : null,
        birthYear: date ? date.getFullYear() : null,
        hasBirthYear: true,
        notificationId: legacyData.notificationId || null,
        reminderStatus: legacyData.notificationId
          ? REMINDER_STATUS.SCHEDULED
          : REMINDER_STATUS.UNAVAILABLE,
        migratedFromLegacy: true,
        legacyId: legacyDocument.id,
        createdAt: legacyData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    migrated += 1;
  });

  if (migrated > 0) {
    await batch.commit();
  }

  return {
    migrated,
    skipped,
  };
}

export async function createBirthday(
  userId,
  birthdayData,
  options = { notificationsEnabled: true },
) {
  const cleanName = birthdayData.name.trim();
  const cleanLastname = birthdayData.lastname.trim();
  const hasBirthYear = Boolean(birthdayData.hasBirthYear);
  const normalizedDate = normalizeBirthdayDate(
    birthdayData.dateBirth,
    hasBirthYear,
  );

  const birthdayRef = await addDoc(getBirthdaysCollection(userId), {
    name: cleanName,
    lastname: cleanLastname,
    dateBirth: Timestamp.fromDate(normalizedDate),
    birthDay: normalizedDate.getDate(),
    birthMonth: normalizedDate.getMonth() + 1,
    birthYear: hasBirthYear ? normalizedDate.getFullYear() : null,
    hasBirthYear,
    notificationId: null,
    reminderStatus: options.notificationsEnabled
      ? REMINDER_STATUS.UNAVAILABLE
      : REMINDER_STATUS.DISABLED,
    migratedFromLegacy: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (!options.notificationsEnabled) {
    return birthdayRef;
  }

  const notificationId = await scheduleBirthdayReminder({
    birthdayId: birthdayRef.id,
    name: cleanName,
    lastname: cleanLastname,
    dateBirth: normalizedDate,
  });

  await updateDoc(birthdayRef, {
    notificationId: notificationId || null,
    reminderStatus: getReminderStatus(
      notificationId,
      options.notificationsEnabled,
    ),
    updatedAt: serverTimestamp(),
  });

  return birthdayRef;
}

export async function updateBirthday(
  userId,
  birthdayId,
  birthdayData,
  options = { notificationsEnabled: true, currentNotificationId: null },
) {
  const cleanName = birthdayData.name.trim();
  const cleanLastname = birthdayData.lastname.trim();
  const hasBirthYear = Boolean(birthdayData.hasBirthYear);
  const normalizedDate = normalizeBirthdayDate(
    birthdayData.dateBirth,
    hasBirthYear,
  );

  if (options.currentNotificationId) {
    await cancelBirthdayReminder(options.currentNotificationId);
  }

  let notificationId = null;

  if (options.notificationsEnabled) {
    notificationId = await scheduleBirthdayReminder({
      birthdayId,
      name: cleanName,
      lastname: cleanLastname,
      dateBirth: normalizedDate,
    });
  }

  const birthdayRef = doc(db, "users", userId, "birthdays", birthdayId);

  return updateDoc(birthdayRef, {
    name: cleanName,
    lastname: cleanLastname,
    dateBirth: Timestamp.fromDate(normalizedDate),
    birthDay: normalizedDate.getDate(),
    birthMonth: normalizedDate.getMonth() + 1,
    birthYear: hasBirthYear ? normalizedDate.getFullYear() : null,
    hasBirthYear,
    notificationId: notificationId || null,
    reminderStatus: getReminderStatus(
      notificationId,
      options.notificationsEnabled,
    ),
    updatedAt: serverTimestamp(),
  });
}

export async function enableBirthdayRemindersForUser(userId) {
  const snapshot = await getDocs(getBirthdaysCollection(userId));
  const batch = writeBatch(db);
  let enabled = 0;

  for (const birthdayDocument of snapshot.docs) {
    const birthday = {
      id: birthdayDocument.id,
      ...birthdayDocument.data(),
    };

    if (birthday.notificationId) continue;

    const notificationId = await scheduleBirthdayReminder({
      birthdayId: birthday.id,
      name: birthday.name,
      lastname: birthday.lastname,
      dateBirth: birthday.dateBirth,
    });

    batch.update(birthdayDocument.ref, {
      notificationId: notificationId || null,
      reminderStatus: notificationId
        ? REMINDER_STATUS.SCHEDULED
        : REMINDER_STATUS.UNAVAILABLE,
      updatedAt: serverTimestamp(),
    });

    enabled += 1;
  }

  if (enabled > 0) {
    await batch.commit();
  }

  return enabled;
}

export async function disableBirthdayRemindersForUser(userId) {
  const snapshot = await getDocs(getBirthdaysCollection(userId));
  const batch = writeBatch(db);
  let disabled = 0;

  for (const birthdayDocument of snapshot.docs) {
    const birthday = birthdayDocument.data();

    if (birthday.notificationId) {
      await cancelBirthdayReminder(birthday.notificationId);
    }

    batch.update(birthdayDocument.ref, {
      notificationId: null,
      reminderStatus: REMINDER_STATUS.DISABLED,
      updatedAt: serverTimestamp(),
    });

    disabled += 1;
  }

  if (disabled > 0) {
    await batch.commit();
  }

  return disabled;
}

export async function removeBirthday(userId, birthdayId, notificationId) {
  await cancelBirthdayReminder(notificationId);

  const birthdayRef = doc(db, "users", userId, "birthdays", birthdayId);

  return deleteDoc(birthdayRef);
}
