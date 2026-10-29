import { requireAdmin, adminDB } from '@/lib/supabase';
import { checkOrigin, apiError } from '@/lib/http';
import { z } from 'zod';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    const form = await request.formData();
    const product = z.uuid().parse(form.get('product_id'));
    const alt = z.string().min(2).max(200).parse(form.get('alt'));
    const position = z.coerce
      .number()
      .int()
      .min(0)
      .max(100)
      .parse(form.get('position'));
    const file = form.get('file');
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      file.size === 0
    )
      throw new Error('Envie uma imagem de até 5 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png =
      bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    const mime = png
      ? 'image/png'
      : jpg
        ? 'image/jpeg'
        : webp
          ? 'image/webp'
          : '';
    if (!mime || file.type !== mime)
      throw new Error('Formato inválido. Use PNG, JPEG ou WebP.');
    const ext = png ? 'png' : jpg ? 'jpg' : 'webp';
    const path = `${product}/${crypto.randomUUID()}.${ext}`;
    const db = adminDB();
    const { error } = await db.storage
      .from('products')
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (error) throw new Error(error.message);
    const { error: e } = await db.rpc('admin_mutate', {
      p_actor: actor.id,
      p_entity: 'product_images',
      p_id: null,
      p_data: { product_id: product, path, alt, position },
    });
    if (e) {
      await db.storage.from('products').remove([path]);
      throw new Error(e.message);
    }
    return Response.json({ path });
  } catch (e) {
    return apiError(e);
  }
}
