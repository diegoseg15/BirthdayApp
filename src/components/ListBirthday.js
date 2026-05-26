// src/components/ListBirthday.js

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  listenBirthdays,
  removeBirthday,
} from '../services/birthdayService';
import { formatDate, getNextBirthdayInfo } from '../utils/date';

export default function ListBirthday({ userId }) {
  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setListError('');

    const unsubscribe = listenBirthdays(
      userId,
      (items) => {
        setBirthdays(items);
        setIsLoading(false);
        setRefreshing(false);
      },
      () => {
        setListError('No se pudieron cargar los cumpleaños.');
        setIsLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const confirmDelete = (birthday) => {
    Alert.alert(
      'Eliminar cumpleaños',
      `¿Quieres eliminar el cumpleaños de ${birthday.name} ${birthday.lastname}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteBirthday(birthday.id),
        },
      ]
    );
  };

  const deleteBirthday = async (birthdayId) => {
    try {
      await removeBirthday(userId, birthdayId);
    } catch {
      Alert.alert(
        'Error',
        'No se pudo eliminar el cumpleaños. Inténtalo nuevamente.'
      );
    }
  };

  const refreshList = () => {
    setRefreshing(true);

    // La lista usa listener en tiempo real; este gesto solo da feedback visual.
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#F97316" size="large" />
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
          tintColor="#F97316"
        />
      }
      ListEmptyComponent={<EmptyState />}
      renderItem={({ item }) => (
        <BirthdayCard birthday={item} onDelete={() => confirmDelete(item)} />
      )}
    />
  );
}

function BirthdayCard({ birthday, onDelete }) {
  const birthdayInfo = getNextBirthdayInfo(birthday.dateBirth);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>
            {birthday.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {birthday.name} {birthday.lastname}
          </Text>

          <Text style={styles.date}>{formatDate(birthday.dateBirth)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{birthdayInfo.label}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.85}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>🎂</Text>
      </View>

      <Text style={styles.emptyTitle}>No hay cumpleaños guardados</Text>
      <Text style={styles.emptyDescription}>
        Agrega tu primer cumpleaños usando el botón superior.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 22,
    paddingBottom: 40,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#1E3040',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  initialCircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    marginRight: 14,
  },
  initialText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  personInfo: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  date: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,115,22,0.14)',
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#FDBA74',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteButton: {
    minHeight: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3040',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 38,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDescription: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});