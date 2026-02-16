import jsQR, { QRCode } from "jsqr";
import { PNG } from "pngjs";

export { SharedCredentialManager } from "./SharedCredentialManager";

export function getSecretFromTokenQRCode(imageSrc: string): string | null {
  const base64Data: string = (imageSrc).replace('data:image/png;base64,', '');
  const buffer: Buffer = Buffer.from(base64Data, 'base64');
  const img: PNG = PNG.sync.read(buffer);

  const qrCode: QRCode | null = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
  if (!qrCode) {
    console.error('Parsing QRCode failed');
    return null;
  }

  const url: URL = new URL(qrCode!.data);
  const otpSecret: string | null = url.searchParams.get('secret');
  if (!otpSecret) {
    console.error('Extracting secret from parsed QRCode failed');
  }
  return otpSecret;
}

