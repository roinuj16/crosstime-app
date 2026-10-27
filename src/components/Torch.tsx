import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { onTorchPulse } from '@/services/feedback';
import { useApp } from '@/store/useApp';

/**
 * Lanterna que pisca a cada troca de fase.
 * O sistema só liga a lanterna com a câmera ativa, então uma prévia invisível de 1 px
 * fica montada enquanto a opção estiver ligada e o treino estiver rodando.
 * Só funciona com o app aberto (limitação do sistema).
 */
export function Torch() {
  const enabled = useApp((s) => s.settings.flash);
  const running = useApp((s) => s.session?.state.status === 'running');
  const [permission] = useCameraPermissions();
  const [on, setOn] = useState(false);

  useEffect(() => onTorchPulse(() => {
    setOn(true);
    setTimeout(() => setOn(false), 350);
  }), []);

  if (Platform.OS === 'web' || !enabled || !running || !permission?.granted) return null;
  return <CameraView style={styles.hidden} facing="back" enableTorch={on} animateShutter={false} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, left: 0, top: 0 },
});
