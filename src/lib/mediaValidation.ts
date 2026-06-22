export type EventMediaKind =
  | 'portrait'
  | 'landscape'
  | 'video'
  | 'gallery'
  | 'artist'
  | 'ticket';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v', 'avi', 'mkv'];

const LABELS: Record<EventMediaKind, string> = {
  portrait: 'Portrait image',
  landscape: 'Landscape image',
  video: 'Event card video',
  gallery: 'Gallery media',
  artist: 'Artist image',
  ticket: 'Ticket image',
};

const fileExtension = (file: File) => {
  const name = file.name || '';
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
};

const isImageFile = (file: File) => {
  if (file.type) return file.type.startsWith('image/');
  return IMAGE_EXTENSIONS.includes(fileExtension(file));
};

const isVideoFile = (file: File) => {
  if (file.type) return file.type.startsWith('video/');
  return VIDEO_EXTENSIONS.includes(fileExtension(file));
};

export function validateEventMediaFile(
  file: File,
  kind: EventMediaKind,
): { ok: true } | { ok: false; message: string } {
  const acceptsImage = kind !== 'video';
  const acceptsVideo = kind === 'video' || kind === 'gallery';
  const isImage = isImageFile(file);
  const isVideo = isVideoFile(file);

  if (kind === 'video' && !isVideo) {
    return { ok: false, message: 'Please upload a video file for Event card video.' };
  }

  if ((kind === 'portrait' || kind === 'landscape' || kind === 'artist' || kind === 'ticket') && !isImage) {
    return { ok: false, message: `Please upload an image file for ${LABELS[kind]}.` };
  }

  if (kind === 'gallery' && !isImage && !isVideo) {
    return { ok: false, message: 'Please upload an image or video file for Gallery media.' };
  }

  if (!acceptsImage && isImage) {
    return { ok: false, message: `Please upload a video file for ${LABELS[kind]}.` };
  }

  if (!acceptsVideo && isVideo) {
    return { ok: false, message: `Please upload an image file for ${LABELS[kind]}.` };
  }

  const maxSizeMB = isVideo ? 5 : 1.5;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      ok: false,
      message: `File size exceeds the allowable limit. Maximum allowed size is ${maxSizeMB}MB.`,
    };
  }

  return { ok: true };
}
