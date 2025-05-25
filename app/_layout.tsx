import FooterNav from "@/components/FooterNav";
import { Stack } from "expo-router";
import React from 'react';
import {StyleSheet, StatusBar, View} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { StorageProvider } from '@/context/StorageContext'
import { migrateDbIfNeeded } from '@/models/migrations'
import { SQLiteProvider } from 'expo-sqlite'
import { DB } from '@/constants/db'


const App = () => (
  <StorageProvider>
    <SQLiteProvider
      databaseName={DB.NAME}
      onInit={migrateDbIfNeeded}
      useSuspense
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: 'transparent', paddingHorizontal: 16 },}}/>
          <FooterNav/>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  </StorageProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: 'transparent'
  },
  scrollView: {
    backgroundColor: 'pink',
  },
  text: {
    fontSize: 42,
    padding: 12,
  },
});

export default App;