import { invokeResilient } from './invokeResilient';

// Extract the readable text of an imported document via the extract-document-text
// edge function. `.txt` is read on the client (see the Journal editor); PDF and
// Word (.docx) come here because their text can't be read on-device.
export type DocumentKind = 'txt' | 'pdf' | 'docx';

export async function extractDocumentText(base64: string, kind: DocumentKind): Promise<string> {
  const data = (await invokeResilient('extract-document-text', { base64, kind })) as { text?: string; error?: string };
  if (data?.error) throw new Error(data.error);
  return data?.text ?? '';
}
