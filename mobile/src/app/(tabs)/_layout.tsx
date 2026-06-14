import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'dark'];

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.outline },
    }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MaterialIcons name="chat" size={size} color={color} /> }} />
    </Tabs>
  );
}
