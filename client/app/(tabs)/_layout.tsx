import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TopNavBar from '../../components/TopNavBar';

export default function TabsLayout() {
  return (
    <>
      <TopNavBar userName="User" />
      <LinearGradient
        colors={["#7C3AED", "#6366F1"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 80,
          zIndex: -1,
        }}
      />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#E0E7FF',
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: 24,
            paddingTop: 12,
            height: 80,
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
            marginTop: 2,
            color: '#fff',
            textShadowColor: '#000',
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 1,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={
                route.name === 'scan' ? 'camera-outline'
                : route.name === 'learn' ? 'book-outline'
                : route.name === 'home' ? 'heart-outline'
                : route.name === 'connections' ? 'people-outline'
                : 'settings-outline'
              }
              size={size}
              color={color}
              style={{
                textShadowColor: focused ? '#A5B4FC' : '#000',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: focused ? 8 : 2,
                shadowColor: focused ? '#A5B4FC' : '#000',
                shadowOffset: { width: 0, height: 0 }, // No move down
                shadowOpacity: focused ? 0.5 : 0.15,
                shadowRadius: focused ? 12 : 2,
                backgroundColor: focused ? 'rgba(124,58,237,0.15)' : 'transparent',
                borderRadius: 16,
                padding: focused ? 0 : 0,
              }}
            />
          ),
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
    </>
  );
}