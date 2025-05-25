import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import IconButton from './IconButton';
import Icon from '@/constants/icons'

interface SearchBarProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  onPress: () => void;
  onPressInInput?: () => void;
}


const SearchBarWithButton: React.FC<SearchBarProps> = ({
  placeholder,
  onChangeText,
  onPress,
  onPressInInput,
}) => {
  return (
    <View style={[styles.container]}>  
      <TextInput
        style={[styles.input]}
        placeholder={placeholder}
        onChangeText={onChangeText}
        onPressIn={onPressInInput}
      />
      <IconButton
        iconUrl={Icon.plus}
        handlePress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  input: {
    flex: 1,
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
});

export default SearchBarWithButton;
