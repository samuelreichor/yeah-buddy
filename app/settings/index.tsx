import FullWidthButton from '@/components/FullWidthButton';
import IconButton from '@/components/IconButton';
import { CSS } from '@/constants/css';
import icons from '@/constants/icons';
import { STORAGE } from '@/constants/storage';
import { useStorage } from '@/context/StorageContext';
import { calculateMacros, Macros } from '@/utils/macros';
import { useRouter, Stack } from 'expo-router';
import React, {useEffect} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type SettingsForm = {
  calGoal: string
  proteinGoal: string
  carbFatRatio: string
}

function Settings() {
  const storage = useStorage();
  const storedString = storage.getString(STORAGE.MACROS);  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsForm>({
    defaultValues: {
      calGoal: '',
      proteinGoal: '',
      carbFatRatio: '',
    },
  });
  const router = useRouter();

  useEffect(() => {
    if (!storedString) return;
    const parsed = JSON.parse(storedString) as Macros;
    reset({
      calGoal:      parsed.totalCalories?.toString() ?? '',
      proteinGoal:  parsed.proteinGrams?.toString() ?? '',
      carbFatRatio: parsed.carbRatio?.toString() ?? '',
    });
  }, [storedString, reset]);

  const onSubmit = (data: SettingsForm) => {
    const parsed = {
      calGoal: parseFloat(data.calGoal) || 0,
      proteinGoal: parseFloat(data.proteinGoal) || 0,
      carbRatio: parseFloat(data.carbFatRatio) || 0,
    };
    const allMacros = calculateMacros(parsed.calGoal, parsed.proteinGoal, parsed.carbRatio);
    console.log(allMacros, parsed.calGoal)

    storage.setItem(STORAGE.MACROS, JSON.stringify(allMacros))

    router.push('/')
  }
  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerStyle: {backgroundColor: CSS.colorWhite},
        headerShadowVisible: false,
        headerShown: true,
        headerLeft: () => (
          <IconButton iconUrl={icons.back} handlePress={() => router.push('/')}/>
        ),
        headerTitle: '',
        }}/>
      <Text style={styles.title}>Settings</Text>

      {/* goal kcal */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="calGoal"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Daily Calorie Goal (kcal)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 1800"
            />
            {errors.calGoal && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* goal proteins */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="proteinGoal"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Daily Protein Goal (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 120"
            />
            {errors.proteinGoal && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      {/* goal proteins */}
      <Controller
        control={control}
        rules={{ required: true }}
        name="carbFatRatio"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Carbs to Fat Ratio(0-1)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 0.4"
            />
            {errors.carbFatRatio && <Text style={styles.error}>This field is required</Text>}
          </View>
        )}
      />

      <FullWidthButton title='Save'   handlePress={() => {
        const submit = handleSubmit(onSubmit);
        submit();
      }}/>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
  },
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
