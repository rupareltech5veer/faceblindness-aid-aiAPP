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

export default function VerifyEmailScreen() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const params = useLocalSearchParams();

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      // The email verification is handled automatically by Supabase
      // when the user clicks the link in their email
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Create user profile after successful verification
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name || 'User',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.replace('/auth/signin');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Email verification failed. Please try again.');
        
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.replace('/auth/signin');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Email verification failed. Please try again.');
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.replace('/auth/signin');
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <ActivityIndicator size="large" color="#FFFFFF" />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />;
      case 'error':
        return <Ionicons name="close-circle" size={64} color="#FFFFFF" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
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
          
          <Text style={styles.title}>Email Verification</Text>
          <Text style={styles.message}>{message}</Text>
          
          {status !== 'verifying' && (
            <Text style={styles.redirectText}>
              Redirecting to sign in...
            </Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

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