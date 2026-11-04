import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Hint, LedText } from '@/components/atoms';
import { SheetTemplate } from '@/components/templates';
import { useStrings } from '@/hooks/useStrings';
import { POLICY } from '@/i18n/privacy';
import { UI } from '@/theme/palette';

/** Página da política de privacidade. */
export default function PrivacyScreen() {
  const { t, lang } = useStrings();
  const P = POLICY[lang];
  return (
    <SheetTemplate title={t.privacy.title} onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
      <Hint small style={{ marginBottom: 6 }}>{P.updated}</Hint>
      {P.sections.map((sec) => (
        <View key={sec.title} style={s.section}>
          <LedText size={21} trim="label" color={UI.text}>{sec.title}</LedText>
          <Text style={s.body}>{sec.body}</Text>
        </View>
      ))}
    </SheetTemplate>
  );
}

const s = StyleSheet.create({
  section: { paddingVertical: 12, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.line },
  body: { color: UI.muted, fontSize: 14, lineHeight: 21 },
});
