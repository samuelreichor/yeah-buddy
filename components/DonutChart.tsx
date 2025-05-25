import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

type DonutChartProps = {
  label: string;
  value: number;
  max: number;
  color: string;
};

function DonutChart({ label, value, max, color }: DonutChartProps) {
  const ratio = Math.min(value / max, 1);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

    <View>
      <Progress.Circle
        size={84}
        progress={1}
        showsText={false}
        thickness={6}
        color={'#eee'}
        borderWidth={0}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />
      <Progress.Circle
        size={84}
        progress={ratio}
        showsText={false}
        thickness={6}
        color={color}
        unfilledColor="transparent"
        borderWidth={0}
      />
    </View>
      <View style={styles.overlay}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>/{max}</Text>
      </View>
    </View>
  );
}

export default DonutChart;

const styles = StyleSheet.create({
  container: { alignItems: 'center'},
  overlay: {
    position: 'absolute',
    top: 45, // (100 − fontSize*2) / 2
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  value: { fontSize: 20, fontWeight: 'bold' },
  unit: { fontSize: 12, color: '#666' },
  label: { marginBottom: 8, fontSize: 14 },
});
