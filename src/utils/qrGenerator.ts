import QRCode from 'qrcode';

export interface GenerateQROptions {
  amount?: number;
  shopName?: string;
}

export const SAFIK_UPI_ID = 'safikjusab@oksbi';
export const SAFIK_UPI_NAME = 'safik Jusab';

/**
 * Builds the standard Indian UPI intent URL
 */
export function buildUpiPayUrl(amount?: number, note = 'Instagram Reel Promotion'): string {
  const base = `upi://pay?pa=${encodeURIComponent(SAFIK_UPI_ID)}&pn=${encodeURIComponent(SAFIK_UPI_NAME)}&cu=INR`;
  if (amount && amount > 0) {
    return `${base}&am=${amount}&tn=${encodeURIComponent(note)}`;
  }
  return base;
}

/**
 * Renders the Google Pay styled QR Card onto a high-res Canvas
 */
export async function renderSafikGPayCardCanvas(options?: GenerateQROptions): Promise<HTMLCanvasElement> {
  const width = 600;
  const height = 820;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas 2d context');

  // Background: clean off-white / very light blue
  ctx.fillStyle = '#f3f6fa';
  ctx.fillRect(0, 0, width, height);

  // Center Card
  const cardX = 36;
  const cardY = 36;
  const cardW = width - 72;
  const cardH = height - 120;
  const radius = 28;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.restore();

  // Draw Header: Avatar + "safik Jusab"
  const avatarX = cardX + 54;
  const avatarY = cardY + 54;
  const avatarR = 24;

  // Red/Orange circle
  ctx.fillStyle = '#c53828';
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fill();

  // White "s" in circle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('s', avatarX, avatarY + 1);

  // Name "safik Jusab"
  ctx.fillStyle = '#1f2937';
  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('safik Jusab', avatarX + 36, avatarY + 2);

  // Generate QR code onto temporary canvas
  const upiUrl = buildUpiPayUrl(options?.amount, options?.shopName ? `Promo - ${options.shopName}` : undefined);
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, upiUrl, {
    errorCorrectionLevel: 'H',
    width: 380,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Draw QR code centered in the card
  const qrSize = 380;
  const qrX = (width - qrSize) / 2;
  const qrY = cardY + 115;
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // GPay Center Emblem on QR
  const centerCenterX = qrX + qrSize / 2;
  const centerCenterY = qrY + qrSize / 2;
  const badgeRadius = 32;

  // White circular cutout in center
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerCenterX, centerCenterY, badgeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle border around center badge
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f1f3f4';
  ctx.stroke();

  // Draw GPay colored capsule/pill shapes in center
  // Left Blue, Top Yellow, Right Red, Bottom Green
  const pillW = 8;
  const pillH = 16;
  const rOffset = 10;

  // Blue #4285F4
  ctx.fillStyle = '#4285F4';
  ctx.beginPath();
  ctx.roundRect(centerCenterX - rOffset - pillW / 2, centerCenterY - pillH / 2, pillW, pillH, 4);
  ctx.fill();

  // Green #34A853
  ctx.fillStyle = '#34A853';
  ctx.beginPath();
  ctx.roundRect(centerCenterX + rOffset - pillW / 2, centerCenterY - pillH / 2, pillW, pillH, 4);
  ctx.fill();

  // Yellow #FBBC05
  ctx.fillStyle = '#FBBC05';
  ctx.beginPath();
  ctx.roundRect(centerCenterX - pillH / 2, centerCenterY - rOffset - pillW / 2, pillH, pillW, 4);
  ctx.fill();

  // Red #EA4335
  ctx.fillStyle = '#EA4335';
  ctx.beginPath();
  ctx.roundRect(centerCenterX - pillH / 2, centerCenterY + rOffset - pillW / 2, pillH, pillW, 4);
  ctx.fill();

  ctx.restore();

  // Text below QR: "UPI ID: safikjusab@oksbi"
  ctx.fillStyle = '#374151';
  ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UPI ID: safikjusab@oksbi', width / 2, qrY + qrSize + 42);

  // Optional Amount Badge if remaining amount is set
  if (options?.amount && options.amount > 0) {
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`બાકી રકમ: ₹${options.amount.toLocaleString('en-IN')}`, width / 2, qrY + qrSize + 76);
  }

  // Footer: "Scan to pay with any UPI app"
  ctx.fillStyle = '#6b7280';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan to pay with any UPI app', width / 2, height - 42);

  return canvas;
}

/**
 * Generates PNG data URL and File Blob for Safik GPay QR card
 */
export async function generateSafikGPayImage(options?: GenerateQROptions): Promise<{ dataUrl: string; blob: Blob }> {
  const canvas = await renderSafikGPayCardCanvas(options);
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
  return { dataUrl, blob };
}
