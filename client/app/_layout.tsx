import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            title: 'Welcome',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="policy" 
          options={{ 
            title: 'Getting Started',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="auth/signin" 
          options={{ 
            title: 'Sign In',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="auth/signup" 
          options={{ 
            title: 'Sign Up',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            title: 'FaceAssist',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="learning" 
          options={{ 
            title: 'Learning Center',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Face Blindness Aid',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="upload" 
          options={{ 
            title: 'Upload Photo',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="directory" 
          options={{ 
            title: 'Photo Directory'
          }} 
        />
      </Stack>
    </>
  );
}