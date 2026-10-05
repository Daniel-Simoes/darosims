import { isSupabaseDatabase } from '@/database/provider';
import * as files from '@/repositories/users/userRepository.files';
import * as supabase from '@/repositories/users/userRepository.supabase';

const repo = isSupabaseDatabase() ? supabase : files;

export const readAllUsers = repo.readAllUsers;
export const findUserByEmail = repo.findUserByEmail;
export const findUserEmailByName = repo.findUserEmailByName;
export const listPublicUsers = repo.listPublicUsers;
export const updateUserByEmail = repo.updateUserByEmail;
export const getPhotoFileName = repo.getPhotoFileName;
export const getPhotoFilePath = repo.getPhotoFilePath;
export const ensureDefaultAdminFromEnv = repo.ensureDefaultAdminFromEnv;
