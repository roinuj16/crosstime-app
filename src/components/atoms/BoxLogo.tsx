import { Image } from 'react-native';

/** Logo do box (imagem escolhida pelo coach, guardada como data URL). */
export function BoxLogo({ uri, size }: { uri: string; size: number }) {
  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size * 0.22 }} resizeMode="contain" accessibilityIgnoresInvertColors />;
}
