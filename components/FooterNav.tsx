import { View, Button } from 'react-native'
import { useRouter } from 'expo-router';


export default function FooterNav () {
  const router = useRouter();

  return(
    <View style={{width: '100%', height: 80, padding: 16,paddingInline: 24, flexDirection: 'row', justifyContent: 'space-between'}}>
      <Button title="Home" onPress={() => router.push('/')} />
      <Button title="Meals" onPress={() => router.push('/meals')} />
      <Button title="Ingredients" onPress={() => router.push('/ingredients')} />
    </View>
  )
}