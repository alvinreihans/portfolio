// Public profiles shown in the hero and the contact section (specs/04-pages.md).
export const SOCIAL_LINKS = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/alvinreihans', icon: 'linkedin' },
  { name: 'GitHub', href: 'https://github.com/alvinreihans', icon: 'github' },
  { name: 'Instagram', href: 'https://www.instagram.com/alvinreihans', icon: 'instagram' },
] as const;

// Already public on the live site footer (CLAUDE.md rule 10).
export const EMAIL = 'alvinreihans@gmail.com';

export type SocialIcon = (typeof SOCIAL_LINKS)[number]['icon'];
