import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

// Map tab names to gradients
const TAB_GRADIENTS = {
  home: ["#6366F1", "#8B5CF6"],
  learn: ["#8B5CF6", "#D946EF"],
  scan: ["#D946EF", "#6366F1"],
  settings: ["#7C3AED", "#6366F1"],
  connections: ["#06B6D4", "#6366F1"],
  profile: ["#F59E42", "#6366F1"],
};

export default function TopNavBar({ tabName = 'home', gradientColors }) {
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
    
    return () => {
      supabase.removeChannel(channel);
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

  // Use tab gradient or fallback
  const textGradient = gradientColors || TAB_GRADIENTS[tabName] || ["#6366F1", "#8B5CF6"];
  return (
    <LinearGradient
      colors={textGradient}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradient}
    >
      <Text style={styles.text}>Welcome {userName}</Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
});
