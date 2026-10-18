import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

export default function Chip({ label, selected = false, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.idle,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.text, { color: selected ? colors.textOnDark : colors.indigo700 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  idle: { backgroundColor: colors.cream50, borderColor: colors.cream300 },
  selected: { backgroundColor: colors.indigo900, borderColor: colors.indigo900 },
  text: { ...typography.caption, fontWeight: '700' },
});
