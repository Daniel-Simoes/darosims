import { corsHeaders } from '@/lib/auth';
import { readProfilePhoto } from '@/services/users/profileService';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const file = url.searchParams.get('file');
  if (!file) {
    return new Response('Not found', { status: 404, headers: corsHeaders() });
  }

  const photo = await readProfilePhoto(file);
  if (!photo) {
    return new Response('Not found', { status: 404, headers: corsHeaders() });
  }

  return new Response(new Uint8Array(photo.buffer), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': photo.contentType,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
