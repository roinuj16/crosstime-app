/**
 * Confirmações e avisos que funcionam no celular e no navegador.
 * O Alert do React Native não faz nada na web; lá usamos as caixas do próprio navegador.
 */
import { Alert, Platform } from 'react-native';

/** Pergunta antes de uma ação (zerar, apagar…). Resolve true se a pessoa confirmar. */
export function confirmAction(title: string, message: string | undefined, ok: string, cancel: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancel, style: 'cancel', onPress: () => resolve(false) },
      { text: ok, style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

/** Aviso simples (ex.: "Salvo em Meus treinos"). */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
