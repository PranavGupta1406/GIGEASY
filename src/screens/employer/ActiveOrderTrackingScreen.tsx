import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontFamily } from '../../constants';
import { api } from '../../services/api';

const BRAND = {
  navy: '#1A68D5',
  background: '#F8FAFC',
  text: '#1E293B',
  subText: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
  green: '#10B981',
};

export function ActiveOrderTrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Poll for live updates every 5 seconds
  useEffect(() => {
    let interval: any;
    
    async function loadOrder() {
      try {
        const data = await api.getActiveOrders();
        const found = data.find((o: any) => o.order_id === orderId);
        if (found) {
          setOrder(found);
        }
      } catch (err) {
        console.error('Error fetching live order:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadOrder();
    interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BRAND.navy} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Order not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainApp', { initialMode: 'employer' })} style={styles.backButton}>
          <Text style={styles.backText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.order_id}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Live Status</Text>
          <Text style={styles.statusValue}>{order.status.replace('_', ' ')}</Text>
        </View>

        <Text style={styles.sectionTitle}>Workers Assigned</Text>
        
        {order.items?.map((item: any) => (
          <View key={item.order_item_id} style={styles.itemBlock}>
            <Text style={styles.itemTitle}>{item.service_name} (Requested: {item.quantity})</Text>
            
            {item.assignments?.length > 0 ? (
              item.assignments.map((assignment: any) => (
                <View key={assignment.booking_id} style={styles.assignmentCard}>
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>{assignment.worker_name}</Text>
                    <Text style={styles.workerStatus}>Status: {assignment.booking_status}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.searchingText}>Searching for workers...</Text>
            )}
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background },
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
  scrollContent: { padding: 16 },
  statusCard: {
    backgroundColor: BRAND.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: 'center',
  },
  statusLabel: { fontFamily: FontFamily.regular, fontSize: 14, color: BRAND.subText, marginBottom: 4 },
  statusValue: { fontFamily: FontFamily.bold, fontSize: 22, color: BRAND.green },
  sectionTitle: { fontFamily: FontFamily.semiBold, fontSize: 18, color: BRAND.text, marginBottom: 16 },
  itemBlock: { marginBottom: 20 },
  itemTitle: { fontFamily: FontFamily.medium, fontSize: 15, color: BRAND.text, marginBottom: 8 },
  assignmentCard: {
    backgroundColor: BRAND.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  workerInfo: { flex: 1 },
  workerName: { fontFamily: FontFamily.semiBold, fontSize: 15, color: BRAND.text },
  workerStatus: { fontFamily: FontFamily.regular, fontSize: 13, color: BRAND.navy, marginTop: 4 },
  searchingText: { fontFamily: FontFamily.regular, fontStyle: 'italic', color: BRAND.subText, fontSize: 14, marginLeft: 8 },
});
