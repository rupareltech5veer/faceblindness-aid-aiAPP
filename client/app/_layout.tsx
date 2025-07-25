import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Initial flow screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="title" />
        
        {/* Authentication screens */}
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="auth/verify-email" />
        
        {/* Main app with tabs */}
        <Stack.Screen name="(tabs)" />
        
        {/* Profile screen */}
        <Stack.Screen name="profile" />
        
        {/* Legacy screens for backward compatibility */}
        <Stack.Screen name="policy" />
      </Stack>
    </View>
  );
}