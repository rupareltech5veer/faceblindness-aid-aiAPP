import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
        
        {/* Hidden screens */}
        <Tabs.Screen
          name="onboarding"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="policy"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="auth"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="learning"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="directory"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}