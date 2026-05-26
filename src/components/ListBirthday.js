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

export default function ListBirthday({ userId, theme }) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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
      data={birthdays}
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
      ListEmptyComponent={<EmptyState styles={styles} theme={theme} />}
      renderItem={({ item }) => (
        <BirthdayCard
          birthday={item}
          styles={styles}
          onDelete={() => confirmDelete(item)}
        />
      )}
    />
  );
}

function BirthdayCard({ birthday, styles, onDelete }) {
  const birthdayInfo = getNextBirthdayInfo(birthday.dateBirth, birthday);
  const hasReminder = Boolean(birthday.notificationId);

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

        <View
          style={[
            styles.reminderBadge,
            !hasReminder && styles.reminderBadgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.reminderBadgeText,
              !hasReminder && styles.reminderBadgeTextDisabled,
            ]}
          >
            {hasReminder ? "Recordatorio activo" : "Sin recordatorio"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        activeOpacity={0.85}
      >
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
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
      backgroundColor: theme.colors.successSoft,
      paddingHorizontal: 12,
    },
    reminderBadgeDisabled: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    reminderBadgeText: {
      color: theme.colors.success,
      fontSize: 13,
      fontWeight: "800",
    },
    reminderBadgeTextDisabled: {
      color: theme.colors.textMuted,
    },
    deleteButton: {
      minHeight: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
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
