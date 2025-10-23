/**
 * Avatar utilities for better profile image handling
 * Prioritizes Google profile images with cartoon/avatar fallbacks
 */

// Collection of cartoon/avatar fallback images
export const AVATAR_FALLBACKS = [
  // DiceBear API - Free cartoon avatars
  'https://api.dicebear.com/7.x/avataaars/svg?seed=felix&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=aneka&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=maya&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=john&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=b6e3f4,c0aede,d1d4f9',
  
  // Lorelei style - More diverse cartoon avatars
  'https://api.dicebear.com/7.x/lorelei/svg?seed=felix&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=aneka&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=maya&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=alex&backgroundColor=b6e3f4,c0aede,d1d4f9',
  
  // Fun emojis style
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=felix&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=aneka&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=maya&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=alex&backgroundColor=b6e3f4,c0aede,d1d4f9',
] as const;

/**
 * Get a consistent avatar fallback based on user data
 * Uses a hash of the user's email to ensure the same avatar is always returned for the same user
 */
export function getAvatarFallback(email: string): string {
  // Simple hash function to convert email to a consistent index
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % AVATAR_FALLBACKS.length;
  return AVATAR_FALLBACKS[index];
}

/**
 * Get the best avatar URL prioritizing Google profile images
 * Falls back to cartoon avatars instead of generic images
 */
export function getUserAvatar(user: {
  profile?: {
    avatar?: string;
  };
  email: string;
  photoURL?: string; // Firebase/Google auth photo URL
}): string {
  // Priority 1: Custom uploaded avatar (user's explicit choice)
  if (user.profile?.avatar && !user.profile.avatar.includes('unsplash.com')) {
    return user.profile.avatar;
  }
  
  // Priority 2: Google/Firebase photo URL (from OAuth sign-in)
  if (user.photoURL && user.photoURL.includes('googleusercontent.com')) {
    return user.photoURL;
  }
  
  // Priority 3: Cartoon/avatar fallback based on email
  return getAvatarFallback(user.email);
}

/**
 * Generate initials for avatar fallback
 */
export function getUserInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]?.toUpperCase() || ''}${lastName[0]?.toUpperCase() || ''}`;
  }
  
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  
  return 'U';
}

/**
 * Generate a dynamic avatar URL based on user name for consistency
 */
export function generateUserAvatar(name: string, style: 'avataaars' | 'lorelei' | 'fun-emoji' = 'avataaars'): string {
  const seed = name.toLowerCase().replace(/\s+/g, '');
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}