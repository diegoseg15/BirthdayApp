// src/services/birthdayService.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../utils/firebase";
import {
  cancelBirthdayReminder,
  scheduleBirthdayReminder,
} from "./notificationService";

function getBirthdaysCollection(userId) {
  return collection(db, "users", userId, "birthdays");
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

export async function createBirthday(userId, birthdayData) {
  const cleanName = birthdayData.name.trim();
  const cleanLastname = birthdayData.lastname.trim();
  const birthdayDate = Timestamp.fromDate(birthdayData.dateBirth);

  const birthdayRef = await addDoc(getBirthdaysCollection(userId), {
    name: cleanName,
    lastname: cleanLastname,
    dateBirth: birthdayDate,
    notificationId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

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

export async function removeBirthday(userId, birthdayId, notificationId) {
  await cancelBirthdayReminder(notificationId);

  const birthdayRef = doc(db, "users", userId, "birthdays", birthdayId);

  return deleteDoc(birthdayRef);
}
