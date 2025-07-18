import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function TopNavBar({ gradientColors = ["#7C3AED", "#6366F1"] }) {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    fetchUserName();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
        },
        async (payload) => {
          console.log('Profile updated:', payload);
          // Get current user to check if this update is for them
          const { data: { user } } = await supabase.auth.getUser();
          if (user && payload.new && payload.new.user_id === user.id) {
            console.log('Updating name for current user:', payload.new.full_name);
            setUserName(payload.new.full_name || 'User');
          }
        }
      )
      .subscribe();

    // Also listen for manual refresh events
    const handleProfileUpdate = (event) => {
      if (event.detail && event.detail.fullName) {
        setUserName(event.detail.fullName);
      }
    };
    
    // Add event listener for profile updates
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('profileUpdated', handleProfileUpdate);
    }
    return () => {
      supabase.removeChannel(channel);
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
      }
    };
  }, []);


  const fetchUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (profile?.full_name) {
        setUserName(profile.full_name);
      } else {
        // If no profile exists, create one with user metadata or email as name
        const defaultName = user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'User';
        setUserName(defaultName);
        
        // Create profile in background
        const { error: insertError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            full_name: defaultName,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User');
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/dolphin-logo-nobg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.text}>
          Welcome {userName}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    paddingTop: 64, // More space for dynamic island
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 0, // Match bottom navbar pill shape
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
});
