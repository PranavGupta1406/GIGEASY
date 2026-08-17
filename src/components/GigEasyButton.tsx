// GigEasyButton — Tactile, executive consumer-tech button
// Deep Teal + Electric Lime + Warm Ivory + Ink

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, BorderRadius, Spacing, Shadow } from '../constants';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'teal' | 'lime' | 'vermilion' | 'secondary' | 'outline' | 'ghost';
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
  const getContainerStyle = () => {
    const base: ViewStyle[] = [styles.base];

    // Variant
    switch (variant) {
      case 'primary':
        base.push(styles.primary);
        break;
      case 'teal':
        base.push(styles.teal);
        break;
      case 'lime':
        base.push(styles.lime);
        break;
      case 'vermilion':
        base.push(styles.teal);
        break;
      case 'secondary':
        base.push(styles.secondary);
        break;
      case 'outline':
        base.push(styles.outline);
        break;
      case 'ghost':
        base.push(styles.ghost);
        break;
    }

    // Size
    switch (size) {
      case 'sm':
        base.push(styles.sm);
        break;
      case 'md':
        base.push(styles.md);
        break;
      case 'lg':
        base.push(styles.lg);
        break;
    }

    if (fullWidth) base.push(styles.fullWidth);
    if (disabled) base.push(styles.disabled);
    if (style) base.push(style);

    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle[] = [styles.label];

    switch (variant) {
      case 'primary':
      case 'teal':
      case 'vermilion':
        base.push(styles.labelPrimary);
        break;
      case 'lime':
        base.push(styles.labelLime);
        break;
      case 'secondary':
        base.push(styles.labelSecondary);
        break;
      case 'outline':
      case 'ghost':
        base.push(styles.labelOutline);
        break;
    }

    switch (size) {
      case 'sm':
        base.push(styles.labelSm);
        break;
      case 'lg':
        base.push(styles.labelLg);
        break;
    }

    if (disabled) base.push(styles.labelDisabled);
    if (textStyle) base.push(textStyle);

    return base;
  };

  const isLightText = variant === 'primary' || variant === 'teal' || variant === 'vermilion';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isLightText ? '#FFFFFF' : Colors.dark}
        />
      ) : (
        <View style={styles.contentRow}>
          {iconName && (
            <Feather
              name={iconName}
              size={size === 'sm' ? 14 : 16}
              color={isLightText ? '#FFFFFF' : variant === 'lime' ? '#090D14' : '#0D3B3F'}
              style={styles.icon}
            />
          )}
          <Text style={getTextStyle()}>{label}</Text>
          {showArrow && (
            <View
              style={
                variant === 'lime'
                  ? styles.arrowCircleLime
                  : isLightText
                  ? styles.arrowCirclePrimary
                  : styles.arrowCircleOutline
              }
            >
              <Feather
                name="arrow-right"
                size={14}
                color={variant === 'lime' ? '#FFFFFF' : isLightText ? '#090D14' : '#0D3B3F'}
              />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#090D14', // Ink Slate
    ...Shadow.sm,
  },
  teal: {
    backgroundColor: '#0D3B3F', // Deep Midnight Teal
    ...Shadow.sm,
  },
  lime: {
    backgroundColor: '#C8F135', // Electric Lime
    ...Shadow.sm,
  },
  secondary: {
    backgroundColor: '#F2F0EB',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#090D14',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sm: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3.5],
  },
  md: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  lg: {
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[6],
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: '#E8E6E0',
    borderColor: '#E8E6E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    letterSpacing: -0.3,
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelLime: {
    color: '#090D14',
    fontFamily: FontFamily.extraBold,
  },
  labelSecondary: {
    color: '#090D14',
  },
  labelOutline: {
    color: '#090D14',
  },
  labelSm: {
    fontSize: FontSize.sm,
  },
  labelLg: {
    fontSize: FontSize.md,
  },
  labelDisabled: {
    color: '#8E99A8',
  },
  icon: {
    marginRight: Spacing[2],
  },
  arrowCirclePrimary: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C8F135',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing[2],
  },
  arrowCircleLime: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#090D14',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing[2],
  },
  arrowCircleOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F3F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing[2],
  },
});
