import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockContacts = [
  {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Colleague',
    lastSeen: '2 days ago',
    description: 'Works in marketing, loves coffee',
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@company.com',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    favorite: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    relationship: 'Friend',
    lastSeen: '1 week ago',
    description: 'Plays guitar, has a dog named Rex',
    phone: '+1 (555) 987-6543',
    email: 'mike.chen@email.com',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    favorite: true,
  },
];

export default function ContactsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddContact = () => {
    Alert.alert(
      'Add Contact',
      'Contact management features will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="people-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.title}>My Contacts</Text>
              <Text style={styles.subtitle}>Manage your important connections</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddContact}
            accessibilityLabel="Add new contact"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Contacts List */}
        <View style={styles.contactsList}>
          {filteredContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Image source={{ uri: contact.image }} style={styles.contactImage} />
                <View style={styles.contactInfo}>
                  <View style={styles.nameRow}>
                    {contact.favorite && (
                      <Ionicons name="heart" size={16} color="#EF4444" style={styles.favoriteIcon} />
                    )}
                    <Text style={styles.contactName}>{contact.name}</Text>
                  </View>
                  <View style={styles.relationshipContainer}>
                    <Text style={[
                      styles.relationshipBadge,
                      contact.relationship === 'Colleague' ? styles.colleagueBadge : styles.friendBadge
                    ]}>
                      {contact.relationship}
                    </Text>
                  </View>
                  <View style={styles.lastSeenContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text style={styles.lastSeenText}>Last seen: {contact.lastSeen}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.contactDescription}>{contact.description}</Text>

              <View style={styles.contactActions}>
                <View style={styles.contactDetail}>
                  <Ionicons name="call-outline" size={16} color="#10B981" />
                  <Text style={styles.contactDetailText}>{contact.phone}</Text>
                </View>
                <View style={styles.contactDetail}>
                  <Ionicons name="mail-outline" size={16} color="#6366F1" />
                  <Text style={styles.contactDetailText}>{contact.email}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredContacts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  contactsList: {
    paddingHorizontal: 24,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contactImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteIcon: {
    marginRight: 8,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  relationshipContainer: {
    marginBottom: 8,
  },
  relationshipBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  colleagueBadge: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  friendBadge: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  lastSeenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastSeenText: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 6,
  },
  contactDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  contactActions: {
    gap: 12,
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactDetailText: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});