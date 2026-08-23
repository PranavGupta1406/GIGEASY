import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontFamily } from '../../constants';
import api from '../../services/api';

const BRAND = {
  navy: '#1A68D5',
  background: '#F8FAFC',
  text: '#1E293B',
  subText: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
  green: '#10B981',
};

export function CategoryServicesScreen({ route, navigation }: any) {
  const { categoryId } = route.params;
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServicesByCategory(categoryId);
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [categoryId]);

  const onServiceSelect = (serviceId: string) => {
    navigation.navigate('ServiceConfig', { serviceId });
  };

  return (
    <View style={styles.container}>
      {/* Basic Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Service</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND.navy} style={{ marginTop: 40 }} />
        ) : (
          services.map(service => (
            <TouchableOpacity
              key={service.service_id}
              style={styles.serviceCard}
              onPress={() => onServiceSelect(service.service_id)}
              activeOpacity={0.7}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>Starts at ₹{service.base_price}/day</Text>
                <Text style={styles.serviceEta}>Arrives in {service.estimated_arrival_mins} mins</Text>
              </View>
              <View style={styles.addButton}>
                <Text style={styles.addText}>ADD</Text>
              </View>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.white,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontFamily: FontFamily.medium,
    color: BRAND.navy,
    fontSize: 16,
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 17,
    color: BRAND.text,
  },
  scrollContent: {
    padding: 16,
  },
  serviceCard: {
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
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: BRAND.text,
    marginBottom: 4,
  },
  servicePrice: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: BRAND.subText,
    marginBottom: 4,
  },
  serviceEta: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: BRAND.green,
  },
  addButton: {
    borderWidth: 1,
    borderColor: BRAND.navy,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  addText: {
    fontFamily: FontFamily.bold,
    color: BRAND.navy,
    fontSize: 14,
  },
});
