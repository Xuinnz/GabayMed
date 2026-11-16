import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Settings, BriefcaseMedical, Hospital } from 'lucide-react-native';

export function BottomNav({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', size: 22 },
    { id: 'cases', icon: BriefcaseMedical, label: 'Cases', size: 26 },
    { id: 'facilities', icon: Hospital, label: 'Facilities', size: 26 },
    { id: 'settings', icon: Settings, label: 'Settings', size: 22 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              style={styles.navButton}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
                <Icon color={active ? '#fff' : '#66BAFF'} size={item.size} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: '#66BAFF',
  },
});
