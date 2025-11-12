import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/features/haptic-tab';
// Loại bỏ import IconSymbol vì không còn dùng
// import { IconSymbol } from '@/components/ui/icon-symbol'; 
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // Kích thước icon chuẩn cho các tab
  const iconSize = 24; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tin nhắn',
          // Ionicons: Biểu tượng chat
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-sharp" size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Danh bạ',
          // Ionicons: Biểu tượng danh bạ/người dùng
          tabBarIcon: ({ color }) => <Ionicons name="people-sharp" size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Khám phá',
          // Ionicons: Biểu tượng la bàn/khám phá
          tabBarIcon: ({ color }) => <Ionicons name="compass-sharp" size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wall"
        options={{
          title: 'Tường nhà',
          // Ionicons: Biểu tượng trang chủ
          tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={iconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          // Ionicons: Biểu tượng hồ sơ/người dùng
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-sharp" size={iconSize} color={color} />,
        }}
      />
    </Tabs>
  );
}