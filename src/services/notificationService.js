// src/services/notificationService.js

import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

import { getDateFromFirestoreValue } from "../utils/date";

export const BIRTHDAY_REMINDER_CHANNEL_ID = "birthday-reminders";

function isExpoGoAndroid() {
  return (
    Platform.OS === "android" &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    Constants.expoGoConfig
  );
}

function canUseNotifications() {
  return !isExpoGoAndroid();
}

async function getNotificationsModule() {
  if (!canUseNotifications()) {
    return null;
  }

  return import("expo-notifications");
}

export async function configureNotifications() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      BIRTHDAY_REMINDER_CHANNEL_ID,
      {
        name: "Recordatorios de cumpleaños",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F97316",
      },
    );
  }

  return true;
}

export async function requestNotificationPermissions() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return false;
  }

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
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return null;
  }

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
      color: "#F97316",
      data: {
        type: "birthday-reminder",
        birthdayId,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: 9,
      minute: 0,
      channelId: BIRTHDAY_REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelBirthdayReminder(notificationId) {
  if (!notificationId) return;

  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Si la notificación ya no existe, no bloqueamos la eliminación del cumpleaños.
  }
}