import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1F2937',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              { 
                backgroundColor: focused ? '#1F2937' : 'transparent',
                borderRadius: 8,
                padding: 4,
              }
            ]}>
              <Ionicons 
                name="home" 
                size={24} 
                color={focused ? 'white' : color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dieta"
        options={{
          title: 'Dieta',
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="treino"
        options={{
          title: 'Treino',
          tabBarIcon: ({ color }) => (
            <Ionicons name="fitness" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
