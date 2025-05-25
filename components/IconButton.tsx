import React from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity } from 'react-native'

import { CSS } from '@/constants/css'

type IconButtonProps = {
  iconUrl: ImageSourcePropType,
  handlePress?: () => void,
}

const IconButton = ({iconUrl, handlePress }: IconButtonProps) => {
  return (
    <TouchableOpacity style={styles.btnContainer} onPress={handlePress}>
      <Image source={iconUrl} resizeMode="cover" style={styles.btnImg}/>
    </TouchableOpacity>
  )
}

export default IconButton

const styles = StyleSheet.create({
  btnContainer: {
    width: 44,
    height: 44,
    backgroundColor: CSS.colorBlack,
    borderRadius: CSS.size2,
    justifyContent: "center",
    alignItems: "center",
  },
  btnImg: {
    width: 20,
    height: 20,
  }
});