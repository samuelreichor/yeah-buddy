import { Text, View, TextInput, Button, Alert } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';


const storage = new MMKVLoader().initialize();
export default function App() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })
  const [user, setUser] = useMMKVStorage('user', storage);
  const [age, setAge] = useMMKVStorage('age', storage);
  const onSubmit = (data) => {
    console.log(data)
    setUser(data.firstName);
    setAge(data.lastName);
  }


  return (
    <>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="First name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={{width: '100%', borderColor: 'black', borderWidth: 1}}
          />
        )}
        name="firstName"
      />
      {errors.firstName && <Text>This is required.</Text>}


      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Last name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={{width: '100%', borderColor: 'black', borderWidth: 1}}
          />
        )}
        name="lastName"
      />

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />

      <Text>
        I am {user} and I am {age} years old.
      </Text>
    </>
  )
}