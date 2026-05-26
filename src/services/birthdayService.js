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

function getBirthdaysCollection(userId) {
  return collection(db, "users", userId, "birthdays");
}

function getLegacyBirthdaysCollection(userId) {
  return collection(db, userId);
}

export function listenBirthdays(userId, callback, onError) {
  const birthdaysQuery = query(
    getBirthdaysCollection(userId),
    orderBy("dateBirth", "asc"),
  );

  return onSnapshot(
    birthdaysQuery,
    (snapshot) => {
      const birthdays = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
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
    currentSnapshot.docs.map((document) => document.id),
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
        notificationId: legacyData.notificationId || null,
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
  const birthdayDate = Timestamp.fromDate(birthdayData.dateBirth);

  const birthdayRef = await addDoc(getBirthdaysCollection(userId), {
    name: cleanName,
    lastname: cleanLastname,
    dateBirth: birthdayDate,
    notificationId: null,
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
    dateBirth: birthdayData.dateBirth,
  });

  if (notificationId) {
    await updateDoc(birthdayRef, {
      notificationId,
      updatedAt: serverTimestamp(),
    });
  }

  return birthdayRef;
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

    if (!notificationId) continue;

    batch.update(birthdayDocument.ref, {
      notificationId,
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

    if (!birthday.notificationId) continue;

    await cancelBirthdayReminder(birthday.notificationId);

    batch.update(birthdayDocument.ref, {
      notificationId: null,
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
