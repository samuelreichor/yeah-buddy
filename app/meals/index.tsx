// IngredientList.tsx
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity,  Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router'
import SearchBarWithButton from '@/components/SearchBarWithButton';

type Ingredient = {
  id: number;
  title: string;
  kcal: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

export default function IngredientList() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rows =  await db.getAllAsync('SELECT * FROM MealSummaries;');
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
        <TouchableOpacity onPress={ () => router.push(`/meals/1`)}>
          <Text>Add new</Text>
        </TouchableOpacity>
        <Text>No Meals found, start by adding some.</Text>
      </View>
    );
  }

  return (
    <>
    <SearchBarWithButton placeholder='Search for meals' onPress={() => router.push('/meals/new')} onChangeText={(text) => console.log(text)}/>
    <FlatList
      contentContainerStyle={styles.list}
      data={ingredients}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => router.push(`/meals/${item.id}`)}>
          <Text style={styles.title}>{JSON.stringify(item)}</Text>
        </TouchableOpacity>
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
    marginBottom: 12,
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
