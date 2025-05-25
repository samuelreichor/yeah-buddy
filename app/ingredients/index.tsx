import { StyleSheet, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import SearchBarWithButton from '@/components/SearchBarWithButton'
import IngredientList from '@/components/IngredientList';

export default function Ingredients() {
  const router = useRouter();

  return (
    <View>
      <SearchBarWithButton placeholder='Search for ingredients' onPress={() => router.push('/ingredients/new')} onChangeText={(text) => console.log(text)}/>
        <View style={styles.ingredientWrapper}>
          <IngredientList onCardPress={(item) => router.push(`/ingredients/${item.id}`)}/>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  ingredientWrapper: {
    marginTop: 16,
  }
})