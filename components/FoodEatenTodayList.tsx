// FoodEatenTodayList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import IconButton from './IconButton';
import icons from '@/constants/icons';

type EatenRow = {
  id: number;
  eaten_at: number;
  day: string;
  title: string;
  kcal_consumed: number;
  grams_protein: number;
  grams_carbs: number;
  grams_fat: number;
};

export default function FoodEatenTodayList({ handleDelete, refreshKey }) {
  const db = useSQLiteContext();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<EatenRow[]>([]);

  const loadToday = useCallback(async () => {
    setIsLoading(true);
    try {
      // compute YYYY-MM-DD for today
      const today = new Date().toISOString().slice(0, 10);
      // fetch all eaten items for today
      const rows = await db.getAllAsync<EatenRow>(
        `
        SELECT *
          FROM MealsEatenByDay
         WHERE day = ?
         ORDER BY eaten_at ASC;
        `,
        today
      );
      setItems(rows);
    } catch (e) {
      console.error('Query for recent eaten food failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadToday();
  }, [loadToday, refreshKey]);

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View >
        <Text>You haven’t eaten anything today.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text></Text>
      {items.map(item => (
        <View key={item.id} style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>Kcal: {item.kcal_consumed.toFixed(1)}</Text>
            <Text>Proteins: {item.grams_protein.toFixed(1)} g</Text>
            <Text>Carbohydrates: {item.grams_carbs.toFixed(1)} g</Text>
            <Text>Fat: {item.grams_fat.toFixed(1)} g</Text>
            <View style={styles.button}>
              <IconButton iconUrl={icons.trash} handlePress={() => handleDelete(item.id)}/>
            </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    position: 'absolute',
    right: 16,
    top: 16,
  }
});
