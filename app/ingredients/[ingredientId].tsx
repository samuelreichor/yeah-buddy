import React from 'react';
import EditIngredientForm from '@/components/EditIngredientForm';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';

export default function HomeScreen() {
  const { ingredientId } = useLocalSearchParams()

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
     <Text>
        Edit Meal {ingredientId}
     </Text>
     <EditIngredientForm id={parseFloat(ingredientId as string)}/>
    </ScrollView>
  );
}