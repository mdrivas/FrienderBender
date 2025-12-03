// Simple default avatar - coral person silhouette on pink background
const DEFAULT_AVATAR = "/default-avatar.svg";

/**
 * Get the default avatar path
 */
export function getDefaultAvatar(): string {
  return DEFAULT_AVATAR;
}

/**
 * Get user's avatar with fallback to default
 * @param userImage - User's actual image URL (from OAuth)
 * @param avatarUrl - User's custom avatar URL
 * @returns The best available avatar URL
 */
export function getUserAvatar(
  userImage?: string | null,
  avatarUrl?: string | null
): string {
  // Priority: custom avatar > OAuth image > default SVG
  if (avatarUrl) return avatarUrl;
  if (userImage) return userImage;
  return DEFAULT_AVATAR;
}
