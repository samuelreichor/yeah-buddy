import { CSS } from '@/constants/css'
import { STORAGE } from '@/constants/storage'
import { useStorage } from '@/context/StorageContext'
import { useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DonutChart from './DonutChart'

type MacroData = {
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  calories: number
}

type MacroDataRow = {
  day: string;
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

function MacroOverview({ refreshKey }: {refreshKey: number}) {
  const router = useRouter()
  const storage = useStorage()

  const rawMaxMacros = storage.getString(STORAGE.MACROS)
  let maxMacros = {
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    totalCalories: 0,
  }
  if (rawMaxMacros) {
    maxMacros = JSON.parse(rawMaxMacros);
  }

  const db = useSQLiteContext();
  const [isLoading, setIsLoading] = useState(false);
  const [macroData, setMacroData] = useState<MacroData>({
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    calories: 0,
  });

useEffect(() => {
  let mounted = true;

  const load = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      // Ensure there's an entry for today
      await db.runAsync(
        `INSERT OR IGNORE INTO EatenLog (day) VALUES (?);`,
        today
      );

      // Fetch today's macros
      const row = await db.getFirstAsync<MacroDataRow>(`
        SELECT total_kcal, total_protein, total_carbs, total_fat
          FROM DailyMacros
         WHERE day = date('now','localtime')
      `);

      if (!mounted) return;

      // Update state: use 0 when no data exists
      const todayMacros = {
        calories:     row?.total_kcal     ?? 0,
        proteinGrams: row?.total_protein  ?? 0,
        carbsGrams:   row?.total_carbs    ?? 0,
        fatGrams:     row?.total_fat      ?? 0,
      };

      setMacroData(todayMacros);
    } catch (error) {
      console.error('Error fetching daily macros:', error);
    }
  };

  load();
  return () => { mounted = false; };
}, [db, refreshKey]);
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Macros</Text>
      <View style={styles.donutWrapper}>
        {isLoading
          ? (
            <>
              <DonutChart label='Proteins' value={0} max={maxMacros.proteinGrams} color="#bf0b"/>
              <DonutChart label='Carbohydrates' value={0} max={maxMacros.carbsGrams} color="#bf0b"/>
              <DonutChart label='Fat' value={0} max={maxMacros.fatGrams} color="#bf0b"/>
            </>
          )
          : (
            <>
              <DonutChart label='Proteins' value={macroData.proteinGrams} max={maxMacros.proteinGrams} color="#bf0b"/>
              <DonutChart label='Carbohydrates' value={macroData.carbsGrams} max={maxMacros.carbsGrams} color="#bf0b"/>
              <DonutChart label='Fat' value={macroData.fatGrams} max={maxMacros.fatGrams} color="#bf0b"/>
            </>
          )
        }
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings')}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>

      <View style={styles.calWrapper}>
        <Text style={styles.currentCal}>Calories: {macroData.calories}</Text><Text style={styles.goalCal}>/ {maxMacros.totalCalories} Kcal</Text>
      </View>
    </View>
  )
}

export default MacroOverview

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, 
    paddingVertical: 20,
    borderRadius: 8,
    backgroundColor: '#FAFAFC',
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
  },
  donutWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 8,
    marginTop: 16,
  },
  editBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: CSS.colorBlack,
    borderRadius: 4,
  },
  editBtnText: {
    color: CSS.colorWhite,
  },
  calWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 2,
  },
  currentCal: {
    fontSize: 24,
  },
  goalCal: {
    fontSize: 18,
  }
});
