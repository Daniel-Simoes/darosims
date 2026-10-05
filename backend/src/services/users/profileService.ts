import { promises as fs } from 'fs';
import path from 'path';
import { USER_PHOTOS_DIR } from '@/config/paths';
import { getPermissionsForRole } from '@/lib/permissions';
import {
  findUserByEmail,
  getPhotoFileName,
  getPhotoFilePath,
  updateUserByEmail,
} from '@/repositories/users/userRepository';
import type { AuthUser, UpdateProfilePayload, UserProfile } from '@/types';

function buildDisplayName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
}

function toProfile(user: AuthUser & { password?: string }): UserProfile {
  return {
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    photoUrl: user.photoUrl,
    permissions: user.permissions ?? getPermissionsForRole(user.role),
  };
}

async function savePhotoFromDataUrl(email: string, photoDataUrl: string) {
  const match = photoDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid photo format. Please upload a JPG or PNG image.');
  }

  const mimeType = match[1];
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('Unsupported image type. Use JPG, PNG, or WebP.');
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error('Photo must be 2 MB or smaller.');
  }

  await fs.mkdir(USER_PHOTOS_DIR, { recursive: true });
  const filePath = getPhotoFilePath(email);
  await fs.writeFile(filePath, buffer);
  return `/api/users/profile/photo?file=${encodeURIComponent(getPhotoFileName(email))}`;
}

async function removePhoto(email: string) {
  try {
    await fs.unlink(getPhotoFilePath(email));
  } catch {
    // Ignore missing files.
  }
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return toProfile(user);
}

export async function updateUserProfile(
  currentEmail: string,
  payload: UpdateProfilePayload,
): Promise<{ profile: UserProfile; token?: string }> {
  const user = await findUserByEmail(currentEmail);
  if (!user) {
    throw new Error('User not found');
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const email = payload.email.trim().toLowerCase();

  if (!firstName) {
    throw new Error('First name is required');
  }
  if (!email) {
    throw new Error('Email is required');
  }

  const wantsPasswordChange = Boolean(payload.newPassword?.trim());
  if (wantsPasswordChange) {
    if (!payload.currentPassword?.trim()) {
      throw new Error('Current password is required to set a new password');
    }
    if (user.password !== payload.currentPassword) {
      throw new Error('Current password is incorrect');
    }
    if ((payload.newPassword?.trim().length ?? 0) < 4) {
      throw new Error('New password must be at least 4 characters');
    }
  }

  if (email !== user.email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.email !== user.email) {
      throw new Error('Email is already in use');
    }
  }

  let photoUrl = user.photoUrl;
  if (payload.photoDataUrl === null) {
    await removePhoto(user.email);
    photoUrl = undefined;
  } else if (payload.photoDataUrl) {
    photoUrl = await savePhotoFromDataUrl(email, payload.photoDataUrl);
    if (email !== user.email) {
      await removePhoto(user.email);
    }
  } else if (email !== user.email && user.photoUrl) {
    try {
      const oldPath = getPhotoFilePath(user.email);
      const newPath = getPhotoFilePath(email);
      await fs.mkdir(USER_PHOTOS_DIR, { recursive: true });
      await fs.rename(oldPath, newPath);
      photoUrl = `/api/users/profile/photo?file=${encodeURIComponent(getPhotoFileName(email))}`;
    } catch {
      photoUrl = undefined;
    }
  }

  const updated = await updateUserByEmail(currentEmail, {
    email,
    firstName,
    lastName,
    name: buildDisplayName(firstName, lastName),
    password: wantsPasswordChange ? payload.newPassword!.trim() : user.password,
    photoUrl,
  });

  if (!updated) {
    throw new Error('Failed to update profile');
  }

  return {
    profile: toProfile(updated),
  };
}

export async function readProfilePhoto(fileName: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safeName = path.basename(fileName);
  const filePath = path.join(USER_PHOTOS_DIR, safeName);
  try {
    const buffer = await fs.readFile(filePath);
    const contentType = safeName.endsWith('.png')
      ? 'image/png'
      : safeName.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    return { buffer, contentType };
  } catch {
    return null;
  }
}
