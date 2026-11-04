import QRCode from 'qrcode';
import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

/** QR code desenhado em SVG (sem imagem externa). Margem branca de 2 módulos para a câmera ler bem. */
export function QrCode({ value, size, label }: { value: string; size: number; label: string }) {
  const { n, d } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const n = qr.modules.size;
    let d = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!qr.modules.get(x, y)) continue;
        let w = 1; // junta os quadrados seguidos da linha num retângulo só
        while (x + w < n && qr.modules.get(x + w, y)) w++;
        d += `M${x + 2} ${y + 2}h${w}v1h-${w}z`;
        x += w - 1;
      }
    }
    return { n, d };
  }, [value]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${n + 4} ${n + 4}`} accessibilityLabel={label} accessible>
      <Rect x={0} y={0} width={n + 4} height={n + 4} fill="#F2F2F2" rx={2} />
      <Path d={d} fill="#0B0B0B" />
    </Svg>
  );
}
