import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ingredient } from '@/types/base'
import IconButton from './IconButton'
import icons from '@/constants/icons'

type IngredientCardProps = {
  item: Ingredient
  onPress: (item: Ingredient) => void
  variant?: 'withBtn' | 'default'
}
export default function IngredientCard({item, onPress, variant = 'default'}: IngredientCardProps) {
  const handleCardPress = () => {
    onPress(item);
  };
  return (
    <TouchableOpacity style={styles.item} onPress={handleCardPress}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>Kcal: {item.kcal.toFixed(1)}</Text>
      <Text>Proteins: {item.proteins.toFixed(1)} g</Text>
      <Text>Carbohydrates: {item.carbohydrates.toFixed(1)} g</Text>
      <Text>Fat: {item.fat.toFixed(1)} g</Text>
      {variant === 'withBtn' && 
      <View style={styles.button}>
        <IconButton iconUrl={icons.plus}/>
      </View>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  item: {
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  button: {
    position: 'absolute',
    right: 16,
    top: 16,
  }
})