// GigEasyButton — Warm Premium CTA System
// Primary: Terracotta · Secondary: Warm Sand · Outline: Ivory + Warm Border · Ghost: Transparent · Danger: Warm Red

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
import { Theme } from '../theme';

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
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, tension: 350, friction: 20 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 350, friction: 20 }).start();
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
    if (disabled || loading) return Theme.textDisabled;
    switch (variant) {
      case 'primary': return Theme.textOnAccent;
      case 'secondary': return Theme.ink;
      case 'outline': return Theme.ink;
      case 'ghost': return Theme.ink;
      case 'danger': return Theme.error;
      default: return Theme.textOnAccent;
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
          <ActivityIndicator size="small" color={variant === 'primary' ? Theme.textOnAccent : Theme.ink} />
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
    borderRadius: 12,
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
    backgroundColor: Theme.accent,
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  secondary: {
    backgroundColor: Theme.sandLight,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  outline: {
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
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
    borderRadius: 9,
  },
  md: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    height: 48,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    height: 54,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: Theme.surfaceSubtle,
    borderColor: Theme.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    letterSpacing: -0.1,
  },
  labelSm: { fontSize: FontSize.sm },
  labelLg: { fontSize: FontSize.md },
  icon: { marginRight: -2 },
  arrow: { marginLeft: -2 },
});
