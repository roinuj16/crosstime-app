import { StyleSheet, Text, View } from 'react-native';
import { LedText } from '@/components/atoms';
import { QrCode } from '@/components/molecules';
import { LED, UI } from '@/theme/palette';
import { TV } from '@/theme/tv';

/** Cartão de pareamento da TV: QR code e o código para o celular do coach. */
export function TvPairCard({ title, hint, url, code, u }: { title: string; hint: string; url: string; code: string; u: number }) {
  return (
    <View style={[s.card, { borderRadius: 20 * u, padding: 28 * u, gap: 18 * u, borderWidth: Math.max(1, u) }]}>
      <LedText size={30 * u} variant="display" trim="label" tracking={1.5 * u} color={UI.text}>{title.toUpperCase()}</LedText>
      <QrCode value={url} size={210 * u} label={`${title}: ${code}`} />
      <Text style={[s.hint, { fontSize: 17 * u, lineHeight: 24 * u }]}>{hint}</Text>
      <LedText size={52 * u} variant="display" tabular trim="digits" tracking={6 * u} color={LED.verde}>{code}</LedText>
    </View>
  );
}

/** Faixa compacta de pareamento (QR pequeno e código), embaixo do WOD quando ainda não há celular conectado. */
export function TvPairStrip({ title, url, code, u }: { title: string; url: string; code: string; u: number }) {
  return (
    <View style={[s.strip, { borderRadius: 16 * u, padding: 16 * u, gap: 18 * u, borderWidth: Math.max(1, u) }]}>
      <QrCode value={url} size={104 * u} label={`${title}: ${code}`} />
      <View style={{ flex: 1, gap: 8 * u }}>
        <Text style={{ color: TV.soft, fontSize: 16 * u, lineHeight: 21 * u }}>{title}</Text>
        <LedText size={38 * u} variant="display" tabular trim="digits" tracking={4 * u} color={LED.verde}>{code}</LedText>
      </View>
    </View>
  );
}

/** Aviso no topo da TV: bolinha verde e "Celular do coach conectado". */
export function TvLinkStatus({ label, u }: { label: string; u: number }) {
  return (
    <View style={[s.status, { gap: 10 * u }]}>
      <View style={{ width: 10 * u, height: 10 * u, borderRadius: 5 * u, backgroundColor: LED.verde }} />
      <Text style={{ color: UI.muted, fontSize: 16 * u }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: TV.panel, borderColor: TV.line, alignItems: 'center' },
  hint: { color: TV.soft, textAlign: 'center' },
  status: { flexDirection: 'row', alignItems: 'center' },
  strip: { flexDirection: 'row', alignItems: 'center', backgroundColor: TV.panel, borderColor: TV.line },
});
