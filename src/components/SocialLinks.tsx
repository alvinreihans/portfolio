import { useTranslation } from 'react-i18next';

import { SOCIAL_LINKS } from '../content/links.ts';
import { SOCIAL_ICON_PATHS } from './socialIcons.ts';

interface SocialLinksProps {
  className?: string;
  /** Colour and hover classes for each link; the contact area overrides them on its ground. */
  linkClassName?: string;
  /** A mail icon before the profiles (the contact area, specs/04-pages.md Q4.27). */
  mail?: { href: string; label: string };
}

// A plain envelope outline drawn for this site (not a brand icon): frame, then the flap.
const MAIL_PATH = 'M2 4h20v16H2zM4 6v12h16V6zM4 6l8 6 8-6v2.5l-8 6-8-6z';

export function SocialLinks({
  className = '',
  linkClassName = 'text-ink hover:bg-chip',
  mail,
}: SocialLinksProps) {
  const { t } = useTranslation();

  return (
    <ul className={`flex gap-2 ${className}`}>
      {mail && (
        <li>
          <a
            href={mail.href}
            aria-label={mail.label}
            title={mail.label}
            className={`grid size-11 place-items-center rounded-md ${linkClassName}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
              <path d={MAIL_PATH} fillRule="evenodd" />
            </svg>
          </a>
        </li>
      )}
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
