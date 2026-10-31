// Tech stack from the owner's CV ("Technical skills"), specs/04-pages.md.
// Technology names are not translated; `{ key }` items are phrases that are.

export type StackItem = string | { key: string };

export interface StackGroup {
  group: 'languages' | 'backend' | 'data' | 'ai' | 'cloud';
  items: StackItem[];
}

export const STACK: StackGroup[] = [
  { group: 'languages', items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS'] },
  {
    group: 'backend',
    items: [
      'Node.js',
      'Express.js',
      'Hapi',
      'REST API',
      'JWT Auth',
      'RBAC',
      'Clean Architecture',
      'TDD',
      'MQTT',
    ],
  },
  {
    group: 'data',
    items: ['PostgreSQL', 'MySQL', 'Oracle Database', 'Redis', 'Supabase', 'MinIO'],
  },
  { group: 'ai', items: ['OCR Tesseract', { key: 'llm' }] },
  {
    group: 'cloud',
    items: [
      'AWS (EC2, RDS, S3, IAM)',
      'Google Cloud (Compute Engine, Cloud SQL)',
      'Vercel',
      'GitHub Actions (CI/CD)',
      'Docker',
      'Linux (Ubuntu)',
      'PM2',
      'Nginx',
      'Git',
    ],
  },
];
