import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type ResultSectionProps = {
  title: string;
  items: string[];
};

export const ResultSection = ({ title, items }: ResultSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.stack}>
        {items.map((item) => (
          <View key={`${title}-${item}`} style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.item}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: colors.ink,
  },
  stack: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: colors.coral,
  },
  item: {
    flex: 1,
    color: colors.steel,
    lineHeight: 21,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
});
