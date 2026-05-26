// src/services/notificationService.js

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { getDateFromFirestoreValue } from "../utils/date";

export const BIRTHDAY_REMINDER_CHANNEL_ID = "birthday-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configureNotifications() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(
    BIRTHDAY_REMINDER_CHANNEL_ID,
    {
      name: "Recordatorios de cumpleaños",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#F97316",
    },
  );
}

export async function requestNotificationPermissions() {
  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  return requestedPermissions.granted;
}

export async function scheduleBirthdayReminder({
  birthdayId,
  name,
  lastname,
  dateBirth,
}) {
  await configureNotifications();

  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    return null;
  }

  const birthDate = getDateFromFirestoreValue(dateBirth);

  if (!birthDate) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Recordatorio de cumpleaños",
      body: `Hoy es el cumpleaños de ${name} ${lastname}.`,
      sound: "default",
      color: "#F97316",
      data: {
        type: "birthday-reminder",
        birthdayId,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      month: birthDate.getMonth(),
      day: birthDate.getDate(),
      hour: 9,
      minute: 0,
      channelId: BIRTHDAY_REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelBirthdayReminder(notificationId) {
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Si la notificación ya no existe, no bloqueamos la eliminación del cumpleaños.
  }
}
