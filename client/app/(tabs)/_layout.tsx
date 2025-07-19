import { Tabs } from 'expo-router';
import { View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TopNavBar from '../../components/TopNavBar';
import { useState, useEffect } from 'react';
import { useSegments } from 'expo-router';

// Define gradient colors for each tab
const getTabGradient = (routeName: string): [string, string] => {
  switch (routeName) {
    case 'scan': return ['#A8E063', '#56AB2F'];
    case 'learn': return ['#FFC371', '#FF5F6D'];
    case 'home': return ['#FF9A9E', '#FAD0C4'];
    case 'connections': return ['#4CAF50', '#2196F3'];
    case 'settings': return ['#BDBDBD', '#616161'];
    default: return ['#BDBDBD', '#616161'];
  }
};

// Get the primary color from gradient for text
const getTabTextColor = (routeName: string): string => {
  switch (routeName) {
    case 'scan': return '#56AB2F';
    case 'learn': return '#FF5F6D';
    case 'home': return '#FF9A9E';
    case 'connections': return '#2196F3';
    case 'settings': return '#616161';
    default: return '#616161';
  }
};

export default function TabsLayout() {
  const [currentTab, setCurrentTab] = useState('scan');
  const segments = useSegments();

  // Update currentTab based on the current route
  useEffect(() => {
    const tabName = segments[segments.length - 1];
    if (tabName && ['scan', 'learn', 'home', 'connections', 'settings'].includes(tabName)) {
      setCurrentTab(tabName);
    }
  }, [segments]);

  return (
    <View style={{ flex: 1 }}>
      <TopNavBar gradientColors={getTabGradient(currentTab)} />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            paddingBottom: 32,
            paddingTop: 12,
            paddingHorizontal: 16,
            height: 95,
            position: 'absolute',
            bottom: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarLabel: ({ focused }) => {
            const title = 
              route.name === 'scan' ? 'Scan'
              : route.name === 'learn' ? 'Learn'
              : route.name === 'home' ? 'Home'
              : route.name === 'connections' ? 'Connect'
              : 'Settings';
            
            return (
              <Text style={{
                fontSize: 12,
                fontWeight: focused ? '700' : '600',
                color: focused ? getTabTextColor(route.name) : '#666666',
                marginTop: 8,
                textAlign: 'center',
                textShadowColor: focused ? 'rgba(0,0,0,0.1)' : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}>
                {title}
              </Text>
            );
          },
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = 
              route.name === 'scan' ? (focused ? 'camera' : 'camera-outline')
              : route.name === 'learn' ? (focused ? 'school' : 'school-outline')
              : route.name === 'home' ? (focused ? 'heart' : 'heart-outline')
              : route.name === 'connections' ? (focused ? 'people' : 'people-outline')
              : focused ? 'settings' : 'settings-outline';
            
            if (focused) {
              const gradientColors = getTabGradient(route.name);
              return (
                <LinearGradient
                  colors={gradientColors}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: gradientColors[0],
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons
                    name={iconName as any}
                    size={20}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              );
            }
            
            return (
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons
                  name={iconName as any}
                  size={18}
                  color="#666666"
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