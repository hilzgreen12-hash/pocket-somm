import { File } from 'expo-file-system';
import { supabase } from './supabase';

// Upload a file the member is sharing as a link (a recipe pairing PDF) and
// return its public URL. The name becomes part of the link, so keep it readable.
export async function uploadSharedPdf(userId: string, localUri: string, title: string): Promise<string> {
  const bytes = await new File(localUri).bytes();
  const slug = title.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'recipe';
  const path = `${userId}/recipes/${slug}-${Date.now()}.pdf`;
  const { error } = await supabase.storage.from('shared-files').upload(path, bytes.buffer as ArrayBuffer, { contentType: 'application/pdf', upsert: false });
  if (error) throw error;
  return supabase.storage.from('shared-files').getPublicUrl(path).data.publicUrl;
}
