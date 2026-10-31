import { useTranslation } from 'react-i18next';

import { SOCIAL_LINKS } from '../content/links.ts';
import { SOCIAL_ICON_PATHS } from './socialIcons.ts';

interface SocialLinksProps {
  className?: string;
  /** Colour and hover classes for each link; the contact area overrides them on its ground. */
  linkClassName?: string;
}

export function SocialLinks({
  className = '',
  linkClassName = 'text-ink hover:bg-chip',
}: SocialLinksProps) {
  const { t } = useTranslation();

  return (
    <ul className={`flex gap-2 ${className}`}>
      {SOCIAL_LINKS.map((link) => (
        <li key={link.icon}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.name} ${t('externalLink')}`}
            title={link.name}
            className={`grid size-11 place-items-center rounded-md ${linkClassName}`}
          >
            <svg viewBox="0 0 640 640" className="size-6" fill="currentColor" aria-hidden="true">
              <path d={SOCIAL_ICON_PATHS[link.icon]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
