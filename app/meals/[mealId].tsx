import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import EditMealForm from '@/components/EditMealForm';

export default function HomeScreen() {
  const { mealId } = useLocalSearchParams();

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <View>
      <Text>
        Edit Meal {mealId}
      </Text>
      <EditMealForm id={parseFloat(mealId as string)}/>
      </View>
    </ScrollView>
  );
}