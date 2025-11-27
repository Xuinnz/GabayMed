import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Home, Settings, BriefcaseMedical, Hospital } from 'lucide-react-native';

export function BottomNav({ activeTab, onTabChange, onAIClick }) {
  const navItems = [
    { id: "home", icon: Home, label: "Home", size: 22 },
    { id: "cases", icon: BriefcaseMedical, label: "Cases", size: 30 },
    { id: "chatbot", icon: null, label: "Chatbot", isCustomImage: true, size: 58 },
    { id: "facilities", icon: Hospital, label: "Facilities", size: 30 },
    { id: "settings", icon: Settings, label: "Settings", size: 22 },
  ];

  return (
    <View style={[
      styles.container,
      activeTab === 'chatbot' && styles.containerShrunk
    ]}>
      <View style={styles.navContent}>
        {navItems.map((item, index) => {
          if (item.id === "ai") {
            return (
              <View key={item.id} style={styles.aiButtonWrapper}>
                <TouchableOpacity onPress={onAIClick}>
                  <Image 
                    source={require('../assets/ailogo.svg')} 
                    style={styles.aiLogo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            );
          }

          if (item.isCustomImage) {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onTabChange(item.id)}
                style={styles.navButton}
              >
                <Image 
                  source={require('../assets/mainbutton.jpg')} 
                  style={[
                    {
                      width: item.size,
                      height: item.size,
                      opacity: activeTab === item.id ? 1 : 0.6
                    }
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }

          if (!item.icon) return null;
          
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              style={styles.navButton}
            >
              <View style={[
                styles.iconWrapper,
                activeTab === item.id && styles.iconWrapperActive
              ]}>
                <Icon 
                  color={activeTab === item.id ? "#fff" : "#66BAFF"}
                  size={item.size}
                  fill={activeTab === item.id ? "none" : "none"}
                  strokeWidth={2}
                />
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
    overflow: 'hidden',
  },
  containerShrunk: {
    height: 0,
    paddingVertical: 0,
    paddingBottom: 0,
    borderTopWidth: 0,
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
    iconWrapper: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: '#66BAFF',
  },
  aiButtonWrapper: {
    position: 'absolute',
    left: '50%',
    top: -24,
    marginLeft: -24,
    zIndex: 10,
  },
  aiLogo: {
    width: 48,
    height: 48,
  },
});
