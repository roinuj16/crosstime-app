import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Note, SectionTitle } from '@/components/atoms';
import { AddressBox, LinkRow, Row, SaveBar, StepList } from '@/components/molecules';
import { SheetTemplate } from '@/components/templates';
import { tvAddress, tvUrl } from '@/config/app';
import { formatRoomCode, parseRoomCode } from '@/core/sync';
import { useStrings } from '@/hooks/useStrings';
import { notify } from '@/services/dialog';
import { remoteAvailable, useRemote } from '@/services/remote';
import { cameraAvailable, shareLink } from '@/services/share';
import { isIOSBrowser, isWeb } from '@/services/webApp';
import { useApp } from '@/store/useApp';

/**
 * Conectar à TV do box: passo a passo (abrir o endereço na TV, ler o QR ou digitar o código),
 * o status da conexão e a opção de usar este próprio aparelho como a TV.
 */
export default function ConnectScreen() {
  const { t } = useStrings();
  const C = t.tv.connect;
  const P = t.tv.pair;
  const paired = useApp((s) => s.settings.pairedCode);
  const set = useApp((s) => s.setSetting);
  const remote = useRemote();
  const [code, setCode] = useState('');

  const connect = () => {
    const c = parseRoomCode(code);
    if (!c) { notify(C.title, P.invalid); return; }
    set('pairedCode', c);
    setCode('');
  };
  const share = async () => {
    if ((await shareLink(C.shareMsg(tvUrl()), tvUrl())) === 'copied') notify(C.copied, tvUrl());
  };

  const linked = remote.status === 'online' && !!remote.peer;
  const statusHint = remote.status === 'error' ? P.error : linked ? undefined : P.waiting;

  return (
    <SheetTemplate title={C.title} keyboard onBack={() => router.back()} right={<Button label={t.settings.done} kind="primary" onPress={() => router.back()} />}>
      {!remoteAvailable && <Note>{C.unavailable}</Note>}

      {remoteAvailable && !!paired && (
        <Row
          label={linked ? C.statusOn(formatRoomCode(paired)) : P.tvOf(formatRoomCode(paired))}
          hint={statusHint}
          right={<Button label={P.disconnect} kind="danger" onPress={() => set('pairedCode', '')} />}
        />
      )}

      {remoteAvailable && !paired && cameraAvailable() && (
        <View style={{ marginTop: 16 }}>
          <Button label={C.scan} kind="primary" onPress={() => router.push('/scan')} style={{ alignItems: 'center', paddingVertical: 14 }} />
        </View>
      )}
      {remoteAvailable && !paired && (
        <SaveBar value={code} onChange={setCode} placeholder={`${P.codeLabel} (K7Q-4M2)`} label={C.connectShort} onSave={connect} />
      )}

      {remoteAvailable && (
        <>
          <SectionTitle title={C.how} />
          <StepList
            steps={[
              { text: C.step1, extra: <AddressBox address={tvAddress()} action={C.share} onAction={share} /> },
              { text: C.step2 },
              { text: C.step3 },
            ]}
          />
          <Note variant="help">{C.hardware}</Note>
          {isWeb && isIOSBrowser() && <Note variant="help">{C.iosTip}</Note>}
        </>
      )}

      <SectionTitle title={P.section} />
      <LinkRow label={C.thisDevice} hint={C.thisDeviceHint} onPress={() => router.push('/tv')} />
    </SheetTemplate>
  );
}

