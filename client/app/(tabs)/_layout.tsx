import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 100,
          zIndex: -1,
        }}
      />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: 32,
            paddingTop: 16,
            height: 100,
            position: 'absolute',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = 
              route.name === 'scan' ? (focused ? 'camera' : 'camera-outline')
              : route.name === 'learn' ? (focused ? 'school' : 'school-outline')
              : route.name === 'home' ? (focused ? 'heart' : 'heart-outline')
              : route.name === 'connections' ? (focused ? 'people' : 'people-outline')
              : focused ? 'settings' : 'settings-outline';
            
            return (
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: focused ? '#FFFFFF' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: focused ? 0.3 : 0,
                shadowRadius: focused ? 8 : 0,
                elevation: focused ? 4 : 0,
              }}>
                <Ionicons
                  name={iconName as any}
                  size={focused ? 26 : 24}
                  color={color}
                />
              </View>
            );
          },
          headerShown: false,
        })}
      >
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="connections"
          options={{
            title: 'Connect',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>
    </View>
  );
}