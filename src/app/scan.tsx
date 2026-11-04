import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LedText } from '@/components/atoms';
import { codeFromScan } from '@/core/sync';
import { useStrings } from '@/hooks/useStrings';
import { useApp } from '@/store/useApp';
import { LED, UI } from '@/theme/palette';

/**
 * Leitor do QR code da TV, dentro do app. Aceita o link da TV (…/pair?code=…) ou só o código.
 * No app usa o leitor nativo da câmera; no navegador, o BarcodeDetector (ou a alternativa do expo-camera).
 */
export default function ScanScreen() {
  const { t } = useStrings();
  const C = t.tv.connect;
  const [perm, request] = useCameraPermissions();
  const [wrong, setWrong] = useState(false);
  const [failed, setFailed] = useState(false);
  const done = useRef(false);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pede a câmera logo ao abrir (a pessoa tocou em "Escanear", então já sabe para quê)
  useEffect(() => { if (perm && !perm.granted && perm.canAskAgain) request(); }, [perm?.granted, perm?.canAskAgain]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (wrongTimer.current) clearTimeout(wrongTimer.current); }, []);

  const onScan = ({ data }: BarcodeScanningResult) => {
    if (done.current) return;
    const code = codeFromScan(data);
    if (!code) {
      setWrong(true);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrong(false), 2500);
      return;
    }
    done.current = true;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    useApp.getState().setSetting('pairedCode', code);
    router.back();
  };

  const granted = !!perm?.granted;
  const message = failed ? C.scanNoCamera : perm && !granted && !perm.canAskAgain ? C.scanDenied : null;

  return (
    <View style={s.root}>
      {granted && !failed && (
        <CameraView
          style={StyleSheet.absoluteFill} facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onScan}
          onMountError={() => setFailed(true)}
        />
      )}
      <SafeAreaView style={s.overlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={s.top}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.cancel} style={s.close}>
            <Ionicons name="close" size={26} color={UI.text} />
          </Pressable>
          <LedText size={22} trim="label" color={UI.text} tracking={1}>{C.scanTitle.toUpperCase()}</LedText>
          <View style={s.close} />
        </View>

        <View style={[s.frame, wrong && { borderColor: LED.vermelho }]} />

        <View style={s.bottom}>
          {message ? <Text style={s.msg}>{message}</Text> : <Text style={[s.msg, wrong && { color: LED.vermelho }]}>{wrong ? C.scanWrong : C.scanAim}</Text>}
          {perm && !granted && perm.canAskAgain && !failed && <Button label={C.scanAllow} kind="primary" onPress={request} />}
          {(message || failed) && <Button label={C.typeCode} onPress={() => router.back()} />}
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 12, paddingTop: 8 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.45)' },
  frame: { width: 250, height: 250, borderRadius: 24, borderWidth: 3, borderColor: LED.verde },
  bottom: { alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingBottom: 28 },
  msg: { color: UI.text, fontSize: 16, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, overflow: 'hidden' },
});
