import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useSQLiteContext } from 'expo-sqlite';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import FullWidthButton from '@/components/FullWidthButton';
import IconButton from './IconButton';
import { CSS } from '@/constants/css';
import Icons from '@/constants/icons';

type IngredientEntry = {
  selectedIngredientId: number | null;
  gramms: string;
};

interface MealFormData {
  title: string;
  ingredients: IngredientEntry[];
}

interface EditMealFormProps {
  id?: number;
}

export default function EditMealForm({ id }: EditMealFormProps) {
  const db = useSQLiteContext();
  const isEditing = typeof id === 'number' && !Number.isNaN(id)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MealFormData>({
    defaultValues: {
      title: '',
      ingredients: [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const [allIngredients, setAllIngredients] = useState<{
    id: number;
    title: string;
    kcal: number;
    proteins: number;
    carbohydrates: number;
    fat: number;
  }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  // Load available ingredients
  useEffect(() => {
    (async () => {
      try {
        const rows = await db.getAllAsync<{
          id: number;
          title: string;
          kcal: number;
          proteins: number;
          carbohydrates: number;
          fat: number;
        }>(`SELECT id, title, kcal, proteins, carbohydrates, fat FROM Ingredients;`);
        setAllIngredients(rows);
      } catch (error) {
        console.error('Error loading ingredients list', error);
      } finally {
        setLoadingIngredients(false);
      }
    })();
  }, [db]);

  // If editing, load meal and its ingredients
  useEffect(() => {
    if (isEditing) {
      (async () => {
        try {
          // Load meal title
          const mealRow = await db.getFirstAsync<{ title: string }>(
            'SELECT title FROM Meals WHERE id = ?;', id
          );
          if (!mealRow) {
            return;
          }
          // Load meal ingredients
          const miRows = await db.getAllAsync<{
            ingredient_id: number;
            grams: number;
          }>(
            'SELECT ingredient_id, grams FROM MealIngredients WHERE meal_id = ?;',
            id
          );
          // Prepare form values
          const formIngredients: IngredientEntry[] = miRows.map(mi => ({
            selectedIngredientId: mi.ingredient_id,
            gramms: mi.grams.toString(),
          }));
          reset({ title: mealRow.title, ingredients: formIngredients });
        } catch (error) {
          console.error('Error loading meal for editing', error);
          Alert.alert('Error', 'Failed to load meal data.');
        }
      })();
    }
  }, [isEditing, id, db, reset]);

  const openSelectModal = (index: number) => {
    setActiveIndex(index);
    setModalVisible(true);
  };

  const selectIngredient = (ingredient: typeof allIngredients[0]) => {
    if (activeIndex !== null) {
      update(activeIndex, {
        selectedIngredientId: ingredient.id,
        gramms: fields[activeIndex].gramms,
      });
    }
    setModalVisible(false);
    setActiveIndex(null);
  };

  const onSubmit = async (data: MealFormData) => {
    try {
      // If editing, clean old entries
      if (isEditing && id) {
        await db.runAsync('DELETE FROM MealIngredients WHERE meal_id = ?;', id);
        await db.runAsync('DELETE FROM Meals WHERE id = ?;', id);
      }
      // Insert or re-insert meal
      const mealResult = await db.runAsync(
        `INSERT INTO Meals (title) VALUES (?);`,
        data.title.trim()
      );
      const mealId = mealResult.lastInsertRowId;

      // Insert ingredients
      for (const entry of data.ingredients) {
        if (entry.selectedIngredientId !== null && entry.gramms) {
          await db.runAsync(
            `INSERT INTO MealIngredients (meal_id, ingredient_id, grams) VALUES (?, ?, ?);`,
            mealId,
            entry.selectedIngredientId,
            parseFloat(entry.gramms)
          );
        }
      }
      Alert.alert('Success', `Meal ${isEditing ? 'updated' : 'saved'} successfully!`);
    } catch (error) {
      console.error('Save Meal Error:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} meal.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Meal Title"
            />
            {errors.title && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* Ingredient Rows */}
      <View style={styles.ingredients}>
        {fields.map((field, index) => {
          const selected = field.selectedIngredientId !== null;
          const ingredientData = allIngredients.find(i => i.id === field.selectedIngredientId);
          return (
            <View key={field.id} style={styles.ingredientWrapper}>
              <View style={styles.rowHeader}>
                {selected && ingredientData ? (
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.title}>{ingredientData.title}</Text>
                    <Text style={styles.nutrient}>
                      {ingredientData.kcal} kcal, {ingredientData.proteins} P, {ingredientData.carbohydrates} C, {ingredientData.fat} F
                    </Text>
                  </View>
                ) : (
                  <IconButton iconUrl={Icons.plus} handlePress={() => openSelectModal(index)} />
                )}
                <IconButton iconUrl={Icons.trash} handlePress={() => remove(index)} />
              </View>
              <Controller
                control={control}
                name={`ingredients.${index}.gramms` as const}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Gramms</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="e.g. 100"
                    />
                    {errors.ingredients?.[index]?.gramms && <Text style={styles.error}>This field is required</Text>}
                  </View>
                )}
              />
            </View>
          );
        })}
      </View>

      {/* Add Ingredient */}
      <FullWidthButton type='secondary' title="Add Ingredient" handlePress={() => append({ selectedIngredientId: null, gramms: '' })} />

      {/* Save/Update */}
      <View style={styles.saveButton}>
        <FullWidthButton title={isEditing ? 'Update' : 'Save'} handlePress={handleSubmit(onSubmit)} />
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1}} edges={['top']}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Ingredient</Text>
                <IconButton iconUrl={Icons.x} handlePress={() => setModalVisible(false)} />
              </View>
              {loadingIngredients ? (
                <ActivityIndicator size="large" />
              ) : (
                <FlatList
                  data={allIngredients}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => selectIngredient(item)}>
                      <Text style={styles.modalItemText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 0 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, fontSize: 16 },
  error: { color: 'red', fontSize: 12, marginTop: 4 },
  ingredients: { marginTop: 20 },
  ingredientWrapper: { borderColor: '#ccc', padding: 16, borderWidth: 1, borderRadius: CSS.size2, marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  ingredientInfo: {},
  title: { fontSize: 18, fontWeight: '600' },
  nutrient: { fontSize: 14, color: '#555' },
  saveButton: { marginTop: 16 },
  modalContainer: { flex: 1, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  modalItemText: { fontSize: 16 },
});
