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
} from "firebase/firestore";

import { db } from "../utils/firebase";

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

  return addDoc(getBirthdaysCollection(userId), {
    name: cleanName,
    lastname: cleanLastname,
    dateBirth: Timestamp.fromDate(birthdayData.dateBirth),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeBirthday(userId, birthdayId) {
  const birthdayRef = doc(db, "users", userId, "birthdays", birthdayId);

  return deleteDoc(birthdayRef);
}
