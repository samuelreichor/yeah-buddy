import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import SearchBarWithButton from '@/components/SearchBarWithButton';
import MacroOverview from '@/components/MacroOverview';
import FoodEatenTodayList from '@/components/FoodEatenTodayList';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import IconButton from '@/components/IconButton';
import icons from '@/constants/icons';

type ResultItem = {
  id: number;
  name: string;
  type: 'meal' | 'ingredient';
};

export default function App() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [meals, setMeals] = useState<ResultItem[]>([]);
  const [ingredients, setIngredients] = useState<ResultItem[]>([]);

  // Load meals and ingredients when modal opens or searchText changes
  useEffect(() => {
    if (!modalVisible) return;
    (async () => {
      try {
        const mealRows = await db.getAllAsync<{ id: number; title: string }>(
          `SELECT id, title FROM MealSummaries WHERE title LIKE ? LIMIT 20;`,
          `%${searchText}%`
        );
        setMeals(
          mealRows.map(m => ({ id: m.id, name: m.title, type: 'meal' }))
        );

        const ingRows = await db.getAllAsync<{ id: number; title: string }>(
          `SELECT id, title FROM Ingredients WHERE title LIKE ? LIMIT 20;`,
          `%${searchText}%`
        );
        setIngredients(
          ingRows.map(i => ({ id: i.id, name: i.title, type: 'ingredient' }))
        );
      } catch (error) {
        console.error('Search error:', error);
      }
    })();
  }, [db, searchText, modalVisible]);

  // Add ingredient entry
  async function addIngredient(id: number) {
    try {
      const row = await db.getFirstAsync<{
        kcal: number;
        proteins: number;
        carbohydrates: number;
        fat: number;
      }>(
        `SELECT kcal, proteins, carbohydrates, fat FROM Ingredients WHERE id = ?;`,
        id
      );
      if (!row) return console.error('No ingredient with id:', id);
      const today = new Date().toISOString().slice(0, 10);
      await db.runAsync(
        `INSERT INTO EatenLog (day, ingredient_id, kcal_consumed, grams_protein, grams_carbs, grams_fat)
         VALUES (?, ?, ?, ?, ?, ?);`,
        today,
        id,
        row.kcal,
        row.proteins,
        row.carbohydrates,
        row.fat
      );
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error('Error adding ingredient:', e);
    }
  }

  // Add meal entry
  async function addMeal(id: number) {
    try {
      const row = await db.getFirstAsync<{
        total_kcal: number;
        total_proteins: number;
        total_carbs: number;
        total_fat: number;
      }>(
        `SELECT total_kcal, total_proteins, total_carbs, total_fat
           FROM MealSummaries WHERE id = ?;`,
        id
      );
      if (!row) return console.error('No summary for meal id:', id);
      const today = new Date().toISOString().slice(0, 10);
      await db.runAsync(
        `INSERT INTO EatenLog (day, meal_id, kcal_consumed, grams_protein, grams_carbs, grams_fat)
         VALUES (?, ?, ?, ?, ?, ?);`,
        today,
        id,
        row.total_kcal,
        row.total_proteins,
        row.total_carbs,
        row.total_fat
      );
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error('Error adding meal:', e);
    }
  }

  // Delete eaten entry
  const handleDelete = async (id: number) => {
    try {
      await db.runAsync(`DELETE FROM EatenLog WHERE id = ?;`, id);
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error('Failed to delete eaten item:', e);
    }
  };

  // merge and sort results (meals first then ingredients)
  const results: ResultItem[] = [...meals, ...ingredients];

  return (
    <View style={{ flex: 1 }}>
      <SearchBarWithButton
        placeholder="Search for Meals or Ingredients"
        onPressInInput={() => {
          setModalVisible(true);
        }}
        onChangeText={text => {
          setSearchText(text);
          setModalVisible(true);
        }}
        onPress={() => setModalVisible(true)}
      />

      <MacroOverview refreshKey={refreshKey} />

      <Text style={styles.sectionTitle}>Eaten Today</Text>
      <FoodEatenTodayList handleDelete={handleDelete} refreshKey={refreshKey} />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={[ 'top' ]} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Meals or Ingredients"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              <IconButton iconUrl={icons.x} handlePress={() => setModalVisible(false)}/>
            </View>

            <Text style={styles.subHeader}>Results</Text>
            <FlatList
              data={results}
              keyExtractor={item => `${item.type}-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => {
                    if (item.type === 'meal') addMeal(item.id);
                    else addIngredient(item.id);
                    setModalVisible(false);
                  }}
                >
                  <Text>
                    {item.name} <Text style={styles.typeTag}>[{item.type}]</Text>
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <Text>No results found</Text>
                </View>
              )}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  modalContainer: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  closeText: {
    marginLeft: 16,
    color: '#007AFF',
    fontSize: 16,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
    marginTop: 16,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 16,
  },
  typeTag: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    marginTop: 32,
  },
});