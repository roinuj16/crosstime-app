import { Teko_500Medium, Teko_600SemiBold, useFonts } from '@expo-google-fonts/teko';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UI } from '@/theme/palette';

export default function RootLayout() {
  const [loaded] = useFonts({ Teko_500Medium, Teko_600SemiBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: UI.bg }} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: UI.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="colors" />
        <Stack.Screen name="voices" />
        <Stack.Screen name="workouts" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
