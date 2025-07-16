import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
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
        
        {/* Main app with tabs */}
        <Stack.Screen name="(tabs)" />
        
        {/* Legacy screens for backward compatibility */}
        <Stack.Screen name="policy" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="learning" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="directory" />
        <Stack.Screen name="contacts" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}