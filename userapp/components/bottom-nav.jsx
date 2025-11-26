import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Heart, FileText, Building2, Settings } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

export function BottomNav({ activeTab, onTabChange, onAIClick }) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "cases", icon: FileText, label: "Cases" },
    { id: "ai", icon: null, label: "AI" },
    { id: "medical", icon: Heart, label: "Medical" },
    { id: "facilities", icon: Building2, label: "Facilities" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {navItems.map((item, index) => {
          if (item.id === "ai") {
            return (
              <View key={item.id} style={styles.aiButtonWrapper}>
                <TouchableOpacity onPress={onAIClick} style={styles.aiButton}>
                  <View style={styles.aiButtonInner}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="white">
                      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </Svg>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          const Icon = item.icon;
          if (!Icon) return null;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              style={styles.navButton}
            >
              <Icon 
                size={24} 
                color={activeTab === item.id ? "#0ea5e9" : "#9ca3af"} 
              />
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
    position: 'relative',
  },
  navButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  aiButtonWrapper: {
    position: 'absolute',
    left: '50%',
    top: -24,
    marginLeft: -28,
    zIndex: 10,
  },
  aiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
