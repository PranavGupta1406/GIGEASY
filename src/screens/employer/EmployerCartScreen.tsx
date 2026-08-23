import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontFamily } from '../../constants';
import api from '../../services/api';

const BRAND = {
  navy: '#1A68D5',
  background: '#F8FAFC',
  text: '#1E293B',
  subText: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
  red: '#EF4444',
  green: '#10B981'
};

export function EmployerCartScreen({ navigation }: any) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const onCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setCheckingOut(true);
    try {
      // Mock address for now (would collect via UI normally)
      const orderData = {
        work_site_address: 'Plot 45, Okhla Phase 3, New Delhi',
        latitude: 28.5355,
        longitude: 77.2631,
        contact_person: 'Site Manager',
        phone: '9876543210',
        special_instructions: 'Call upon arrival'
      };
      
      const order = await api.checkoutCart(orderData);
      navigation.navigate('ActiveOrderTracking', { orderId: order.order_id });
    } catch (err) {
      console.error('Checkout failed:', err);
      Alert.alert('Checkout Failed', 'Something went wrong while placing your order.');
    } finally {
      setCheckingOut(false);
    }
  };

  const totalAmount = cart?.items?.reduce((sum: number, item: any) => sum + (Number(item.base_price) * item.quantity), 0) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND.navy} style={{ marginTop: 40 }} />
        ) : (!cart || cart.items.length === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          <>
            {cart.items.map((item: any) => (
              <View key={item.cart_item_id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.service_name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} worker(s) · {item.date} @ {item.shift_time}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>₹{Number(item.base_price) * item.quantity}</Text>
              </View>
            ))}

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₹{totalAmount}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cart && cart.items.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout} disabled={checkingOut}>
            <Text style={styles.checkoutText}>{checkingOut ? 'Processing...' : `Place Order (₹${totalAmount})`}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: BRAND.white,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backButton: { width: 60 },
  backText: { fontFamily: FontFamily.medium, color: BRAND.navy, fontSize: 16 },
  headerTitle: { fontFamily: FontFamily.semiBold, fontSize: 17, color: BRAND.text },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: FontFamily.medium,
    color: BRAND.subText,
    fontSize: 16,
  },
  cartItem: {
    backgroundColor: BRAND.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: BRAND.text,
    marginBottom: 4,
  },
  itemDetails: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: BRAND.subText,
  },
  itemPrice: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: BRAND.text,
  },
  summaryContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: BRAND.text,
  },
  summaryValue: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: BRAND.navy,
  },
  footer: {
    padding: 16,
    backgroundColor: BRAND.white,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingBottom: 40,
  },
  checkoutButton: {
    backgroundColor: BRAND.navy,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    fontFamily: FontFamily.bold,
    color: BRAND.white,
    fontSize: 16,
  }
});
