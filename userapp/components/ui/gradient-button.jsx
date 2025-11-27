import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

export function GradientButton({ 
  onPress, 
  children, 
  style, 
  textStyle,
  colors = ['#83BFF0', '#66BAFF'],
  disabled = false,
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={colors}
        style={[styles.button, style]}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// For wrapping any content with gradient background
export function GradientView({ 
  children, 
  style, 
  colors = ['#83BFF0', '#66BAFF'],
}) {
  return (
    <LinearGradient colors={colors} style={style}>
      {children}
    </LinearGradient>
  );
}

// For gradient text
export function GradientText({
  children,
  style,
  colors = ['#A8D8F0', '#4A9FD4'],
}) {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]}>
          {children}
        </Text>
      }
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

// For gradient icon wrapper
export function GradientIcon({
  children,
  style,
  colors = ['#A8D8F0', '#4A9FD4'],
}) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
