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