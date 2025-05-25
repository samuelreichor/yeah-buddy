// IngredientList.tsx
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity,  Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router'
import IngredientCard from './IngredientCard';
import { Ingredient } from '@/types/base';

type IngredientListProp = {
  onCardPress: (item: Ingredient) => void;
  cardVariant?: 'withBtn' | 'default'
}
export default function IngredientList({onCardPress, cardVariant = 'default'}: IngredientListProp) {
  const router = useRouter();
  const db = useSQLiteContext();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await db.getAllAsync<Ingredient>(`
          SELECT id, title, kcal, proteins, carbohydrates, fat
          FROM Ingredients;
        `);
        setIngredients(rows);
      } catch (err) {
        console.error('Error loading ingredients:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (ingredients.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Ingredients found, start by adding some.</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        contentContainerStyle={styles.list}
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <IngredientCard item={item} onPress={onCardPress} variant={cardVariant}/>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 0,
  },
  item: {
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
});
