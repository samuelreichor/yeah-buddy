import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'

import { CSS } from '@/constants/css'

type FullWidthButtonProps = {
  title: string,
  handlePress: () => void,
  type?: 'primary' | 'secondary', 
}

const FullWidthButton = ({title, handlePress, type = 'primary' }: FullWidthButtonProps) => {
  return (
    <TouchableOpacity style={[styles.btnContainer, styles[type]]} onPress={handlePress}>
      <Text style={[styles.btnText, styles[`${type}BtnText`]]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default FullWidthButton

const styles = StyleSheet.create({
  btnContainer: {
    width: '100%',
    height: 44,
    borderRadius: CSS.size2,
    justifyContent: "center",
    alignItems: "center",
  },
  primary: {
    backgroundColor: CSS.colorBlack,
    color: CSS.colorWhite,
  },
  secondary: {
    backgroundColor: CSS.colorWhite,
    borderColor: CSS.colorBlack,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 18,
    fontWeight: 500,
  },
  primaryBtnText: {
    color: CSS.colorWhite,
  },
  secondaryBtnText: {
    color: CSS.colorBlack,
  }
});