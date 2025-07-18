import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const params = useLocalSearchParams();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the current session after the redirect
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        // Check if this is email verification or password reset
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Create or update user profile if it doesn't exist
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              });

            if (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }

          // Check if this is a password recovery session
          if (params.type === 'recovery' || session.user.recovery_sent_at) {
            setStatus('success');
            setMessage('Password reset verified! You can now set a new password.');
            
            // Redirect to password reset screen after 2 seconds
            setTimeout(() => {
              router.replace('/auth/reset-password');
            }, 2000);
          } else {
            // Regular email verification
            setStatus('success');
            setMessage('Email verified successfully!');
            
            // Redirect to sign in after 2 seconds
            setTimeout(() => {
              router.replace('/auth/signin');
            }, 2000);
          }
        } else {
          throw new Error('No user found in session');
        }
      } else {
        throw new Error('No session found');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.replace('/auth/signin');
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <ActivityIndicator size="large" color="#FFFFFF" />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />;
      case 'error':
        return <Ionicons name="close-circle" size={64} color="#FFFFFF" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return ['#6366F1', '#8B5CF6'];
      case 'success':
        return ['#10B981', '#059669'];
      case 'error':
        return ['#EF4444', '#DC2626'];
    }
  };

  return (
    <LinearGradient
      colors={getStatusColor()}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {getStatusIcon()}
          </View>
          
          <Text style={styles.title}>Authentication</Text>
          <Text style={styles.message}>{message}</Text>
          
          {status !== 'processing' && (
            <Text style={styles.redirectText}>
              Redirecting...
            </Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  redirectText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});