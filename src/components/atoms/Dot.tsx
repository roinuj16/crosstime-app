import { View } from 'react-native';

/** Bolinha de cor (amostra de uma cor de LED). */
export function Dot({ color, size = 14 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}
