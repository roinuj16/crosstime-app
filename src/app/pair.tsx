import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Button, Note } from '@/components/atoms';
import { SheetTemplate } from '@/components/templates';
import { parseRoomCode } from '@/core/sync';
import { useStrings } from '@/hooks/useStrings';
import { useApp } from '@/store/useApp';

/** Página aberta pelo QR code da TV (…/pair?code=K7Q4M2): liga este celular à TV e vai para o timer. */
export default function PairScreen() {
  const { t } = useStrings();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const valid = parseRoomCode(String(code ?? ''));
  useEffect(() => {
    if (!valid) return;
    useApp.getState().setSetting('pairedCode', valid);
    router.replace('/');
  }, [valid]);
  return (
    <SheetTemplate title={t.tv.pair.connect} onBack={() => router.replace('/')}>
      {!valid && <Note>{t.tv.pair.invalid}</Note>}
      {!valid && <Button label={t.tv.pair.connect} kind="primary" onPress={() => router.replace('/settings')} />}
    </SheetTemplate>
  );
}
