export interface PresetAvatar {
  id: string;
  name: string;
  dataUrl: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'emerald-grad',
    name: 'Emerald Graduate',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g1)"/><path d="M50 25 L75 38 L50 51 L25 38 Z" fill="white" opacity="0.95"/><path d="M37 44 L37 60 C37 66, 63 66, 63 60 L63 44" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/><path d="M70 39 L70 65 L72 65 L72 39" stroke="white" stroke-width="2"/><circle cx="71" cy="66" r="3" fill="white"/></svg>'
  },
  {
    id: 'indigo-coder',
    name: 'Indigo Developer',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366F1"/><stop offset="100%" stop-color="%234F46E5"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g2)"/><path d="M35 38 L22 50 L35 62" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M65 38 L78 50 L65 62" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M55 32 L45 68" stroke="white" stroke-width="6" stroke-linecap="round"/></svg>'
  },
  {
    id: 'amber-scholar',
    name: 'Amber Scholar',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23D97706"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g3)"/><path d="M28 32 L46 38 L46 68 L28 62 Z" fill="white" opacity="0.95"/><path d="M72 32 L54 38 L54 68 L72 62 Z" fill="white"/><path d="M46 38 L54 38" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  {
    id: 'rose-creator',
    name: 'Rose Designer',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23EC4899"/><stop offset="100%" stop-color="%23DB2777"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g4)"/><circle cx="50" cy="42" r="14" fill="none" stroke="white" stroke-width="5"/><path d="M30 72 C30 58, 70 58, 70 72" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>'
  },
  {
    id: 'violet-scientist',
    name: 'Violet Scientist',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238B5CF6"/><stop offset="100%" stop-color="%237C3AED"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g5)"/><circle cx="50" cy="50" r="16" fill="none" stroke="white" stroke-width="4"/><circle cx="50" cy="50" r="26" fill="none" stroke="white" stroke-width="2" stroke-dasharray="6 4"/><circle cx="50" cy="24" r="5" fill="white"/><circle cx="50" cy="76" r="5" fill="white"/><circle cx="24" cy="50" r="5" fill="white"/><circle cx="76" cy="50" r="5" fill="white"/></svg>'
  },
  {
    id: 'cyan-global',
    name: 'Cyan Innovator',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306B6D4"/><stop offset="100%" stop-color="%230891B2"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g6)"/><circle cx="50" cy="50" r="24" fill="none" stroke="white" stroke-width="4"/><path d="M26 50 L74 50" stroke="white" stroke-width="3"/><path d="M50 26 C58 35, 58 65, 50 74 C42 65, 42 35, 50 26" fill="none" stroke="white" stroke-width="3"/></svg>'
  }
];

/**
 * Optimizes an uploaded image file by drawing it on a canvas, scaling it down,
 * and compressing it as a high-quality, lightweight Base64 JPEG.
 */
export function optimizeImage(file: File, maxWidth = 150, maxHeight = 150): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
