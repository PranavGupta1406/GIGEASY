import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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

export function EmployerOrderHistoryScreen({ shellNavigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.getOrderHistory();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND.navy} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No past orders found.</Text>
        ) : (
          orders.map((order) => (
            <View key={order.order_id} style={styles.card}>
              <Text style={styles.orderId}>Order #{order.order_id}</Text>
              <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
              <Text style={styles.orderStatus}>Status: {order.status}</Text>
              <Text style={styles.orderAmount}>Total: ₹{order.total_amount}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: BRAND.text,
    padding: 16,
    paddingBottom: 0,
  },
  scrollContent: {
    padding: 16,
  },
  emptyText: {
    fontFamily: FontFamily.medium,
    color: BRAND.subText,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: BRAND.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  orderId: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: BRAND.text,
    marginBottom: 4,
  },
  orderDate: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: BRAND.subText,
    marginBottom: 8,
  },
  orderStatus: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: BRAND.navy,
    marginBottom: 4,
  },
  orderAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: BRAND.text,
  },
});
