import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontFamily } from '../../constants';
import { api } from '../../services/api';

const BRAND = {
  navy: '#1A68D5',
  background: '#F8FAFC',
  text: '#1E293B',
  subText: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

export function ServiceConfigScreen({ route, navigation }: any) {
  const { serviceId } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // In a real app, date/time pickers go here
  const mockDate = new Date().toISOString().split('T')[0];
  const mockTime = '09:00:00';

  const onAddToCart = async () => {
    setAdding(true);
    try {
      await api.addCartItem({
        service_id: serviceId,
        quantity,
        date: mockDate,
        shift_time: mockTime,
        duration_hours: 8
      });
      // Navigate to cart or show success
      navigation.navigate('EmployerCart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Service</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Number of Workers Needed</Text>
        <View style={styles.stepper}>
          <TouchableOpacity 
            style={styles.stepperButton} 
            onPress={() => setQuantity(q => Math.max(1, q - 1))}
          >
            <Text style={styles.stepperButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.stepperButton} 
            onPress={() => setQuantity(q => q + 1)}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>Shift: {mockDate} @ {mockTime} (8 Hours)</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={onAddToCart} disabled={adding}>
          <Text style={styles.addToCartText}>{adding ? 'Adding...' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backButton: { width: 60 },
  backText: { fontFamily: FontFamily.medium, color: BRAND.navy, fontSize: 16 },
  headerTitle: { fontFamily: FontFamily.semiBold, fontSize: 17, color: BRAND.text },
  content: {
    padding: 24,
    flex: 1,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: BRAND.text,
    marginBottom: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  stepperButtonText: {
    fontSize: 24,
    color: BRAND.text,
  },
  quantityText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: BRAND.text,
    marginHorizontal: 24,
  },
  note: {
    fontFamily: FontFamily.regular,
    color: BRAND.subText,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingBottom: 40,
  },
  addToCartButton: {
    backgroundColor: BRAND.navy,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addToCartText: {
    fontFamily: FontFamily.bold,
    color: BRAND.white,
    fontSize: 16,
  }
});
