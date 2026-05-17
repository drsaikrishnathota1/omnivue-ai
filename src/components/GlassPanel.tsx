import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { colors, radii } from '../theme';

export const GlassPanel = ({ children }: PropsWithChildren) => {
  return (
    <View style={styles.shell}>
      <BlurView intensity={55} tint="light" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: colors.glass,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  blur: {
    padding: 18,
  },
});
