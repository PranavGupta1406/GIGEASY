// GigEasyButton — Brand Blue (#6497B2) CTA system
// Primary: solid blue · Secondary: soft tint · Outline: blue border · Ghost: transparent
// NO dark navy. NO lime. NO neon.

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, BorderRadius, Spacing } from '../constants';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: keyof typeof Feather.glyphMap;
  showArrow?: boolean;
}

import { Theme } from '../theme';

// Design tokens
const T = {
  primary: Theme.primary,
  primaryDark: Theme.primaryDark,
  primaryLight: Theme.primaryLight,
  primaryMuted: Theme.primaryLight,
  ink: Theme.ink,
  white: Theme.surface,
  border: Theme.border,
  danger: Theme.error,
  dangerLight: Theme.errorLight,
};

export const GigEasyButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconName,
  showArrow = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();
  };

  const getContainerStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.base];
    switch (variant) {
      case 'primary': base.push(styles.primary); break;
      case 'secondary': base.push(styles.secondary); break;
      case 'outline': base.push(styles.outline); break;
      case 'ghost': base.push(styles.ghost); break;
      case 'danger': base.push(styles.danger); break;
    }
    switch (size) {
      case 'sm': base.push(styles.sm); break;
      case 'md': base.push(styles.md); break;
      case 'lg': base.push(styles.lg); break;
    }
    if (fullWidth) base.push(styles.fullWidth);
    if (disabled || loading) base.push(styles.disabled);
    if (style) base.push(style);
    return base;
  };

  const getLabelColor = (): string => {
    if (disabled || loading) return '#9FBDCC';
    switch (variant) {
      case 'primary': return T.white;
      case 'secondary': return T.primary;
      case 'outline': return T.primary;
      case 'ghost': return T.primary;
      case 'danger': return T.danger;
      default: return T.white;
    }
  };

  const getLabelStyle = (): TextStyle[] => {
    const base: TextStyle[] = [styles.label, { color: getLabelColor() }];
    switch (size) {
      case 'sm': base.push(styles.labelSm); break;
      case 'lg': base.push(styles.labelLg); break;
    }
    if (textStyle) base.push(textStyle);
    return base;
  };

  const iconColor = getLabelColor();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], ...(fullWidth ? { width: '100%' } : {}) }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.92}
        style={getContainerStyle()}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'primary' ? T.white : T.primary} />
        ) : (
          <View style={styles.contentRow}>
            {iconName && (
              <Feather name={iconName} size={size === 'sm' ? 14 : 16} color={iconColor} style={styles.icon} />
            )}
            <Text style={getLabelStyle()}>{label}</Text>
            {showArrow && (
              <Feather name="arrow-right" size={size === 'sm' ? 14 : 16} color={iconColor} style={styles.arrow} />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Variants
  primary: {
    backgroundColor: Theme.primary,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  secondary: {
    backgroundColor: Theme.primaryLight,
    borderWidth: 1,
    borderColor: Theme.primaryBorder,
  },
  outline: {
    backgroundColor: Theme.surface,
    borderWidth: 1.5,
    borderColor: Theme.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Theme.errorLight,
    borderWidth: 1,
    borderColor: Theme.errorBorder,
  },
  // Sizes
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
  },
  md: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    height: 50,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    height: 56,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: '#EAF0F5',
    borderColor: '#DDE6EF',
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    letterSpacing: -0.2,
  },
  labelSm: { fontSize: FontSize.sm },
  labelLg: { fontSize: FontSize.md },
  icon: { marginRight: -2 },
  arrow: { marginLeft: -2 },
});
