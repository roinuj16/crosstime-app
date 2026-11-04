import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LedText } from '@/components/atoms';
import { codeFromScan } from '@/core/sync';
import { startQrCamera, type QrCameraError } from '@/services/qrCamera';
import { useStrings } from '@/hooks/useStrings';
import { useApp } from '@/store/useApp';
import { LED, UI } from '@/theme/palette';

/**
 * Leitor do QR code da TV, dentro do app. Aceita o link da TV (…/pair?code=…) ou só o código.
 * No app instalado usa o leitor da câmera do expo-camera; no navegador, o nosso
 * (services/qrCamera.web.ts), que não depende de baixar nada de fora.
 */
const isWeb = Platform.OS === 'web';

export default function ScanScreen() {
  const { t } = useStrings();
  const C = t.tv.connect;
  const [perm, request] = useCameraPermissions();
  const [wrong, setWrong] = useState(false);
  const [failed, setFailed] = useState(false);
  const [webError, setWebError] = useState<QrCameraError | null>(null);
  const done = useRef(false);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const host = useRef<unknown>(null);

  // app instalado: pede a câmera logo ao abrir (a pessoa tocou em "Escanear", então já sabe para quê)
  useEffect(() => { if (!isWeb && perm && !perm.granted && perm.canAskAgain) request(); }, [perm?.granted, perm?.canAskAgain]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (wrongTimer.current) clearTimeout(wrongTimer.current); }, []);

  /** true quando o QR é de uma TV (aí conecta e fecha) */
  const handle = (data: string): boolean => {
    if (done.current) return true;
    const code = codeFromScan(data);
    if (!code) {
      setWrong(true);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrong(false), 2500);
      return false;
    }
    done.current = true;
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    useApp.getState().setSetting('pairedCode', code);
    router.back();
    return true;
  };
  const onScan = ({ data }: BarcodeScanningResult) => { handle(data); };

  // navegador: a câmera entra num <video> dentro desta View
  useEffect(() => {
    if (!isWeb || !host.current) return;
    return startQrCamera(host.current as unknown as HTMLElement, handle, setWebError);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const granted = !!perm?.granted;
  const message = isWeb
    ? webError === 'denied' ? C.scanDenied : webError ? C.scanNoCamera : null
    : failed ? C.scanNoCamera : perm && !granted && !perm.canAskAgain ? C.scanDenied : null;
  const askButton = !isWeb && perm && !granted && perm.canAskAgain && !failed;

  return (
    <View style={s.root}>
      {isWeb && <View ref={host as never} style={StyleSheet.absoluteFill} />}
      {!isWeb && granted && !failed && (
        <CameraView
          style={StyleSheet.absoluteFill} facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onScan}
          onMountError={() => setFailed(true)}
        />
      )}
      <SafeAreaView style={s.overlay} pointerEvents="box-none" edges={['top', 'bottom', 'left', 'right']}>
        <View style={s.top}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.cancel} style={s.close}>
            <Ionicons name="close" size={26} color={UI.text} />
          </Pressable>
          <LedText size={22} trim="label" color={UI.text} tracking={1}>{C.scanTitle.toUpperCase()}</LedText>
          <View style={{ width: 44 }} />
        </View>

        <View style={[s.frame, wrong && { borderColor: LED.vermelho }]} />

        <View style={s.bottom}>
          {message ? <Text style={s.msg}>{message}</Text> : <Text style={[s.msg, wrong && { color: LED.vermelho }]}>{wrong ? C.scanWrong : C.scanAim}</Text>}
          {askButton && <Button label={C.scanAllow} kind="primary" onPress={request} />}
          {!!message && <Button label={C.typeCode} onPress={() => router.back()} />}
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
