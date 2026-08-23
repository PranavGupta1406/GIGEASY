// Legacy WorkerWageScreen — Deprecated (onboarding now navigates directly from Skills to MainApp)
import React from 'react';
import { View, Text } from 'react-native';

export const WorkerWageScreen: React.FC<any> = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Onboarding Complete</Text>
    </View>
  );
};
