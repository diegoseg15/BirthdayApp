// src/components/ListBirthday.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { listenBirthdays, removeBirthday } from "../services/birthdayService";
import { formatDate, getNextBirthdayInfo } from "../utils/date";
import AdCard from "./AdCard";

const AD_INTERVAL = 3;

const SORT_MODES = {
  UPCOMING: "upcoming",
  NAME: "name",
  MONTH: "month",
  RECENT: "recent",
};

const SORT_OPTIONS = [
  {
    label: "Próximos",
    value: SORT_MODES.UPCOMING,
  },
  {
    label: "Nombre",
    value: SORT_MODES.NAME,
  },
  {
    label: "Mes",
    value: SORT_MODES.MONTH,
  },
  {
    label: "Recientes",
    value: SORT_MODES.RECENT,
  },
];

function buildListDataWithAds(birthdays) {
  if (birthdays.length < AD_INTERVAL) {
    return birthdays.map((birthday) => ({
      type: "birthday",
      id: birthday.id,
      birthday,
    }));
  }

  const listData = [];

  birthdays.forEach((birthday, index) => {
    listData.push({
      type: "birthday",
      id: birthday.id,
      birthday,
    });

    const shouldInsertAd =
      (index + 1) % AD_INTERVAL === 0 && index !== birthdays.length - 1;

    if (shouldInsertAd) {
      listData.push({
        type: "ad",
        id: `ad-${index + 1}`,
      });
    }
  });

  return listData;
}

function sortBirthdays(birthdays, sortMode) {
  const sortedBirthdays = [...birthdays];

  if (sortMode === SORT_MODES.NAME) {
    return sortedBirthdays.sort((a, b) => {
      const nameA = `${a.name || ""} ${a.lastname || ""}`.trim().toLowerCase();
      const nameB = `${b.name || ""} ${b.lastname || ""}`.trim().toLowerCase();

      return nameA.localeCompare(nameB);
    });
  }

  if (sortMode === SORT_MODES.MONTH) {
    return sortedBirthdays.sort((a, b) => {
      const monthA = Number(a.birthMonth || 0);
      const monthB = Number(b.birthMonth || 0);
      const dayA = Number(a.birthDay || 0);
      const dayB = Number(b.birthDay || 0);

      if (monthA !== monthB) return monthA - monthB;

      return dayA - dayB;
    });
  }

  if (sortMode === SORT_MODES.RECENT) {
    return sortedBirthdays.sort((a, b) => {
      const timeA = getTimestampValue(a.updatedAt || a.createdAt);
      const timeB = getTimestampValue(b.updatedAt || b.createdAt);

      return timeB - timeA;
    });
  }

  return sortedBirthdays.sort((a, b) => {
    const nextA = getNextBirthdayInfo(a.dateBirth, a);
    const nextB = getNextBirthdayInfo(b.dateBirth, b);

    const daysA = Number.isFinite(nextA.daysLeft) ? nextA.daysLeft : 9999;
    const daysB = Number.isFinite(nextB.daysLeft) ? nextB.daysLeft : 9999;

    if (daysA !== daysB) return daysA - daysB;

    const monthA = Number(a.birthMonth || 0);
    const monthB = Number(b.birthMonth || 0);
    const dayA = Number(a.birthDay || 0);
    const dayB = Number(b.birthDay || 0);

    if (monthA !== monthB) return monthA - monthB;

    return dayA - dayB;
  });
}

function getTimestampValue(value) {
  if (!value) return 0;

  if (value?.toDate) {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
  }

  return 0;
}

export default function ListBirthday({
  userId,
  theme,
  notificationsEnabled,
  onEditBirthday,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [birthdays, setBirthdays] = useState([]);
  const [sortMode, setSortMode] = useState(SORT_MODES.UPCOMING);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const sortedBirthdays = useMemo(
    () => sortBirthdays(birthdays, sortMode),
    [birthdays, sortMode],
  );

  const listData = useMemo(
    () => buildListDataWithAds(sortedBirthdays),
    [sortedBirthdays],
  );

  useEffect(() => {
    setIsLoading(true);
    setListError("");

    const unsubscribe = listenBirthdays(
      userId,
      (items) => {
        setBirthdays(items);
        setIsLoading(false);
        setRefreshing(false);
      },
      () => {
        setListError("No se pudieron cargar los cumpleaños.");
        setIsLoading(false);
        setRefreshing(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const confirmDelete = (birthday) => {
    Alert.alert(
      "Eliminar cumpleaños",
      `¿Quieres eliminar el cumpleaños de ${birthday.name} ${birthday.lastname}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteBirthday(birthday.id, birthday.notificationId),
        },
      ],
    );
  };

  const deleteBirthday = async (birthdayId, notificationId) => {
    try {
      await removeBirthday(userId, birthdayId, notificationId);
    } catch {
      Alert.alert(
        "Error",
        "No se pudo eliminar el cumpleaños. Inténtalo nuevamente.",
      );
    }
  };

  const refreshList = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.centerText}>Cargando cumpleaños...</Text>
      </View>
    );
  }

  if (listError) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorTitle}>Algo salió mal</Text>
        <Text style={styles.centerText}>{listError}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        birthdays.length === 0 && styles.emptyListContent,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshList}
          tintColor={theme.colors.primary}
        />
      }
      ListHeaderComponent={
        birthdays.length > 1 ? (
          <SortBar
            styles={styles}
            sortMode={sortMode}
            onChangeSortMode={setSortMode}
          />
        ) : null
      }
      ListEmptyComponent={<EmptyState styles={styles} theme={theme} />}
      renderItem={({ item }) => {
        if (item.type === "ad") {
          return <AdCard theme={theme} placement="birthday-list" />;
        }

        return (
          <BirthdayCard
            birthday={item.birthday}
            styles={styles}
            theme={theme}
            notificationsEnabled={notificationsEnabled}
            onEdit={() => onEditBirthday(item.birthday)}
            onDelete={() => confirmDelete(item.birthday)}
          />
        );
      }}
    />
  );
}

function SortBar({ styles, sortMode, onChangeSortMode }) {
  return (
    <View style={styles.sortCard}>
      <Text style={styles.sortTitle}>Ordenar por</Text>

      <View style={styles.sortOptions}>
        {SORT_OPTIONS.map((option) => {
          const isActive = sortMode === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.sortChip, isActive && styles.sortChipActive]}
              onPress={() => onChangeSortMode(option.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.sortChipText,
                  isActive && styles.sortChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function BirthdayCard({
  birthday,
  styles,
  theme,
  notificationsEnabled,
  onEdit,
  onDelete,
}) {
  const birthdayInfo = getNextBirthdayInfo(birthday.dateBirth, birthday);
  const reminder = getReminderPresentation(birthday, notificationsEnabled);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>
            {birthday.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {birthday.name} {birthday.lastname}
          </Text>

          <Text style={styles.date}>
            {formatDate(birthday.dateBirth, {
              hasBirthYear: birthday.hasBirthYear ?? true,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.metaBlock}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{birthdayInfo.label}</Text>
        </View>

        <View style={[styles.reminderBadge, styles[reminder.styleKey]]}>
          <Text
            style={[styles.reminderBadgeText, styles[reminder.textStyleKey]]}
          >
            {reminder.label}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={17} color={theme.colors.text} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={17} color={theme.colors.text} />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ styles, theme }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="gift-outline" size={42} color={theme.colors.primary} />
      </View>

      <Text style={styles.emptyTitle}>No hay cumpleaños guardados</Text>
      <Text style={styles.emptyDescription}>
        Agrega tu primer cumpleaños usando el botón central.
      </Text>
    </View>
  );
}

function getReminderPresentation(birthday, notificationsEnabled) {
  if (!notificationsEnabled || birthday.reminderStatus === "disabled") {
    return {
      label: "Recordatorio desactivado",
      styleKey: "reminderBadgeDisabled",
      textStyleKey: "reminderBadgeTextDisabled",
    };
  }

  if (birthday.notificationId || birthday.reminderStatus === "scheduled") {
    return {
      label: "Recordatorio activo",
      styleKey: "reminderBadgeActive",
      textStyleKey: "reminderBadgeTextActive",
    };
  }

  return {
    label: "Recordatorio activado",
    styleKey: "reminderBadgeUnavailable",
    textStyleKey: "reminderBadgeTextUnavailable",
  };
}

function createStyles(theme) {
  return StyleSheet.create({
    listContent: {
      padding: 22,
      paddingBottom: 132,
      backgroundColor: theme.colors.background,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: theme.colors.background,
    },
    centerText: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 12,
    },
    errorTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 6,
    },
    sortCard: {
      borderRadius: 22,
      padding: 16,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
    },
    sortTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 12,
    },
    sortOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    sortChip: {
      borderRadius: 999,
      paddingVertical: 9,
      paddingHorizontal: 13,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sortChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    sortChipText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "900",
    },
    sortChipTextActive: {
      color: "#FFFFFF",
    },
    card: {
      borderRadius: 24,
      padding: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },
    initialCircle: {
      width: 50,
      height: 50,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginRight: 14,
    },
    initialText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "900",
    },
    personInfo: {
      flex: 1,
    },
    name: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 4,
    },
    date: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
    },
    metaBlock: {
      gap: 10,
      marginBottom: 14,
    },
    badge: {
      minHeight: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: 12,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "800",
    },
    reminderBadge: {
      minHeight: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    reminderBadgeActive: {
      backgroundColor: theme.colors.successSoft,
    },
    reminderBadgeDisabled: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    reminderBadgeUnavailable: {
      backgroundColor: theme.colors.primarySoft,
    },
    reminderBadgeText: {
      fontSize: 13,
      fontWeight: "800",
    },
    reminderBadgeTextActive: {
      color: theme.colors.success,
    },
    reminderBadgeTextDisabled: {
      color: theme.colors.textMuted,
    },
    reminderBadgeTextUnavailable: {
      color: theme.colors.primary,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
    },
    editButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      backgroundColor: theme.colors.surfaceAlt,
      paddingHorizontal: 14,
    },
    editButtonText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    deleteButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      backgroundColor: theme.colors.surfaceAlt,
      paddingHorizontal: 14,
    },
    deleteButtonText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 12,
    },
    emptyIcon: {
      width: 84,
      height: 84,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 20,
    },
    emptyTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 10,
    },
    emptyDescription: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },
  });
}
