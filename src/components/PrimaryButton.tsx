import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, radii } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon: LucideIcon;
  tone?: 'dark' | 'light';
  disabled?: boolean;
  busy?: boolean;
};

export const PrimaryButton = ({
  label,
  onPress,
  icon: Icon,
  tone = 'dark',
  disabled = false,
  busy = false,
}: PrimaryButtonProps) => {
  const isDark = tone === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        isDark ? styles.darkButton : styles.lightButton,
        (disabled || busy) && styles.disabledButton,
        pressed && !(disabled || busy) && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {busy ? (
          <ActivityIndicator color={isDark ? colors.paper : colors.ink} />
        ) : (
          <Icon size={18} color={isDark ? colors.paper : colors.ink} />
        )}
        <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radii.pill,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  darkButton: {
    backgroundColor: colors.ink,
  },
  lightButton: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  darkLabel: {
    color: colors.paper,
  },
  lightLabel: {
    color: colors.ink,
  },
});
