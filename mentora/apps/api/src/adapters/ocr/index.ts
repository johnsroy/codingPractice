/**
 * OCR Adapter
 * -----------
 * Extracts text from uploaded files (PDFs, images, scanned documents).
 * Implementations:
 *   - "tesseract" (default) — uses tesseract.js, runs entirely locally, no API key needed.
 *   - "textract"  (production) — AWS Textract, higher accuracy for complex docs.
 *
 * The factory picks the driver from env.OCR_DRIVER.
 * For non-OCR-able types (video, audio, unknown), returns ''.
 */

import { env } from '../../config/env';

export interface OcrAdapter {
  /**
   * Extract plain text from a file.
   * @param input  Absolute filesystem path or a Buffer containing the file.
   * @param mime   MIME type of the file (used to decide whether OCR makes sense).
   * @returns Extracted text, or '' if the format is not supported.
   */
  extractText(input: string | Buffer, mime: string): Promise<string>;
}

// ─── MIME helpers ─────────────────────────────────────────────────────────────

const OCR_SUPPORTED_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'image/gif',
]);

function isSupportedMime(mime: string): boolean {
  return OCR_SUPPORTED_MIMES.has(mime.toLowerCase());
}

// ─── Tesseract adapter (local, no API key) ────────────────────────────────────

class TesseractOcrAdapter implements OcrAdapter {
  async extractText(input: string | Buffer, mime: string): Promise<string> {
    if (!isSupportedMime(mime)) {
      return '';
    }

    try {
      // tesseract.js v5 — recognise from file path or buffer
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');

      let result: { data: { text: string } };
      if (typeof input === 'string') {
        result = await worker.recognize(input);
      } else {
        // Convert buffer to Uint8Array for tesseract.js
        result = await worker.recognize(new Uint8Array(input));
      }

      await worker.terminate();
      return result.data.text.trim();
    } catch (err) {
      console.error('[ocr:tesseract] Recognition failed:', err);
      return '';
    }
  }
}

// ─── AWS Textract adapter (production) ────────────────────────────────────────

class TextractOcrAdapter implements OcrAdapter {
  async extractText(input: string | Buffer, mime: string): Promise<string> {
    if (!isSupportedMime(mime)) {
      return '';
    }

    try {
      const { TextractClient, DetectDocumentTextCommand } = await import(
        '@aws-sdk/client-textract'
      );

      const client = new TextractClient({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });

      let bytes: Uint8Array;
      if (typeof input === 'string') {
        const fs = await import('fs');
        bytes = await fs.promises.readFile(input);
      } else {
        bytes = new Uint8Array(input);
      }

      const command = new DetectDocumentTextCommand({
        Document: { Bytes: bytes },
      });

      const response = await client.send(command);
      const lines = (response.Blocks ?? [])
        .filter((b) => b.BlockType === 'LINE' && b.Text)
        .map((b) => b.Text ?? '');

      return lines.join('\n').trim();
    } catch (err) {
      console.error('[ocr:textract] Recognition failed:', err);
      return '';
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: OcrAdapter | undefined;

export function getOcrAdapter(): OcrAdapter {
  if (_instance) return _instance;

  const driver = env.OCR_DRIVER;

  if (driver === 'textract') {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      console.warn(
        '[ocr] OCR_DRIVER=textract but AWS credentials are missing — falling back to tesseract.',
      );
      _instance = new TesseractOcrAdapter();
    } else {
      _instance = new TextractOcrAdapter();
      console.log('[ocr] Using driver: TextractOcrAdapter');
    }
  } else {
    _instance = new TesseractOcrAdapter();
    console.log('[ocr] Using driver: TesseractOcrAdapter (local)');
  }

  return _instance;
}

export { isSupportedMime, OCR_SUPPORTED_MIMES };
