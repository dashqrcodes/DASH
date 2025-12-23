import QRCode from 'qrcode';

const DEFAULT_DARK = '#2D2D2D';
const DEFAULT_LIGHT = '#FFFFFF00';

export async function generateQrDataUrl(targetUrl: string, accentColor?: string) {
  const darkColor = accentColor ?? DEFAULT_DARK;

  return QRCode.toDataURL(targetUrl, {
    margin: 0,
    color: {
      dark: darkColor,
      light: DEFAULT_LIGHT,
    },
  });
}
