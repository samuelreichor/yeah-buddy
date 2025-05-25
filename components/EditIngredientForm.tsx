import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Text, View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

interface IngredientFormData {
  title: string;
  kcal: string;
  proteins: string;
  carbohydrates: string;
  fat: string;
};

interface IngredientRow extends IngredientFormData {
  id: number
}

type EditIngredientFormProps = {
  id?: number;
};

export default function EditIngredientForm({ id }: EditIngredientFormProps) {
  const db = useSQLiteContext();
  const isEditing = typeof id === 'number' && !Number.isNaN(id);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IngredientFormData>({
    defaultValues: {
      title: '',
      kcal: '',
      proteins: '',
      carbohydrates: '',
      fat: '',
    },
  });

  // Load existing ingredient when editing
  useEffect(() => {
    if (!isEditing) {
      reset({ title: '', kcal: '', proteins: '', carbohydrates: '', fat: '' });
      return;
    }

    (async () => {
      try {
        const row = await db.getFirstAsync<IngredientRow>(
          'SELECT * FROM Ingredients WHERE id = ?;',
          id
        );

        if (row) {
          reset({
            title: row.title,
            kcal: row.kcal.toString(),
            proteins: row.proteins.toString(),
            carbohydrates: row.carbohydrates.toString(),
            fat: row.fat.toString(),
          });
        } else {
          Alert.alert('Error', `No ingredient found with id ${id}`);
        }
      } catch (error) {
        console.error('Failed to load ingredient:', error);
        Alert.alert('Error', 'Failed to load ingredient data.');
      }
    })();
  }, [id, isEditing, db, reset]);

  const onSubmit = async (data: IngredientFormData) => {
    // Parse numeric values
    const parsed = {
      title: data.title.trim(),
      kcal: parseFloat(data.kcal) || 0,
      proteins: parseFloat(data.proteins) || 0,
      carbohydrates: parseFloat(data.carbohydrates) || 0,
      fat: parseFloat(data.fat) || 0,
    };

    try {
      if (isEditing) {
        await db.runAsync(
          `UPDATE Ingredients
             SET title = $title,
                 kcal = $kcal,
                 proteins = $proteins,
                 carbohydrates = $carbohydrates,
                 fat = $fat
           WHERE id = $id;`,
          {
            $title: parsed.title,
            $kcal: parsed.kcal,
            $proteins: parsed.proteins,
            $carbohydrates: parsed.carbohydrates,
            $fat: parsed.fat,
            $id: id,
          }
        );
        Alert.alert('Erfolg', 'Zutat erfolgreich aktualisiert!');
      } else {
        const result = await db.runAsync(
          `INSERT INTO Ingredients
             (title, kcal, proteins, carbohydrates, fat)
           VALUES
             ($title, $kcal, $proteins, $carbohydrates, $fat);`,
          {
            $title: parsed.title,
            $kcal: parsed.kcal,
            $proteins: parsed.proteins,
            $carbohydrates: parsed.carbohydrates,
            $fat: parsed.fat,
          }
        );
        console.log('New ingredient ID:', result.lastInsertRowId);
        Alert.alert('Erfolg', 'Zutat erfolgreich gespeichert!');
        // Clear form for next entry
        reset({ title: '', kcal: '', proteins: '', carbohydrates: '', fat: '' });
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} ingredient.`);
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
              placeholder="Ingredient Title"
            />
            {errors.title && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* kcal */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="kcal"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Calories (kcal)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 18"
            />
            {errors.kcal && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* proteins */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="proteins"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Proteins (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 0.9"
            />
            {errors.proteins && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* carbohydrates */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="carbohydrates"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 3.9"
            />
            {errors.carbohydrates && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* fat */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="fat"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 0.2"
            />
            {errors.fat && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      <Button title={isEditing ? 'Update' : 'Save'} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  error: { color: 'red', fontSize: 12, marginTop: 4 },
});
