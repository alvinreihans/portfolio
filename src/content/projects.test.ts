import { describe, expect, it } from 'vitest';

import { describeFlow, layoutFlow, parseFlow } from './flow.ts';
import { loadStory, nextProject, PROJECTS, projectBySlug, storyImage } from './projects.ts';

describe('projects', () => {
  it('lists the seven projects in order, Money Tracker first', () => {
    expect(PROJECTS.map((project) => project.slug)).toEqual([
      'money-tracker',
      'teman-jalan',
      'garuda-chat-forum',
      'video-belajar',
      'plant-classification-api',
      'cropoptima',
      'notes-app',
    ]);
  });

  it('gives every project a title and summary in both languages, and https links', () => {
    for (const project of PROJECTS) {
      for (const lang of ['id', 'en'] as const) {
        expect(project.title[lang]).toBeTruthy();
        expect(project.summary[lang]).toBeTruthy();
      }
      for (const href of Object.values(project.links)) expect(href).toMatch(/^https:\/\//);
    }
  });

  it('finds projects by slug and wraps "next" around', () => {
    expect(projectBySlug('cropoptima')?.title.en).toBe('CropOptima');
    expect(projectBySlug('nope')).toBeUndefined();
    expect(nextProject('money-tracker').slug).toBe('teman-jalan');
    expect(nextProject('notes-app').slug).toBe('money-tracker');
  });

  it('loads the story in the requested language and has both for every project', async () => {
    for (const project of PROJECTS) {
      const id = await loadStory(project.slug, 'id');
      const en = await loadStory(project.slug, 'en');
      expect(id.lang).toBe('id');
      expect(en.lang).toBe('en');
      expect(id.text.length).toBeGreaterThan(100);
      expect(en.text).not.toBe(id.text);
    }
  });

  it('only resolves images inside the project folder', () => {
    expect(storyImage('money-tracker', 'https://example.com/x.png')).toBeUndefined();
    expect(storyImage('money-tracker', './images/missing.avif')).toBeUndefined();
  });

  it('reads the image size from the file name', () => {
    const image = storyImage('money-tracker', './images/catat-mobile-780x1688.avif');
    expect(image?.url).toBeTruthy();
    expect(image).toMatchObject({ width: 780, height: 1688 });
  });
});

describe('parseFlow', () => {
  const flow = parseFlow(
    'IoT device (every 5s) -> MQTT broker -> *Express API -> Redis (live state)\nExpress API -> MySQL (history)',
  );

  it('reads chains, notes, and highlights, and merges nodes with the same name', () => {
    expect(flow.chains).toEqual([
      ['IoT device', 'MQTT broker', 'Express API', 'Redis'],
      ['Express API', 'MySQL'],
    ]);
    expect(flow.nodes).toHaveLength(5);
    expect(flow.nodes.find((node) => node.name === 'Express API')?.highlight).toBe(true);
    expect(flow.nodes.find((node) => node.name === 'IoT device')?.note).toBe('every 5s');
  });

  it('describes the diagram as text for screen readers', () => {
    expect(describeFlow(flow, 'then')).toBe(
      'IoT device, then MQTT broker, then Express API, then Redis. Express API, then MySQL.',
    );
  });

  it('rejects a node it cannot read', () => {
    expect(() => parseFlow('A -> (only a note)')).toThrow();
  });
});

describe('layoutFlow', () => {
  it('places each node once, on the level of its longest path, with every arrow once', () => {
    const layout = layoutFlow(
      parseFlow(
        [
          'Photo -> sharp -> *Gemini -> Validation -> Transaction',
          'Gemini -> Tesseract -> Groq -> Validation',
          'Validation -> Draft',
        ].join('\n'),
      ),
    );
    expect(layout.rows).toEqual([
      ['Photo'],
      ['sharp'],
      ['Gemini'],
      ['Tesseract'],
      ['Groq'],
      ['Validation'],
      ['Transaction', 'Draft'],
    ]);
    expect(layout.edges).toContainEqual(['Gemini', 'Validation']);
    expect(layout.edges).toHaveLength(8);
  });

  it('puts several starting nodes side by side', () => {
    const layout = layoutFlow(
      parseFlow(
        [
          'PWA -> *API route -> Gemini',
          'API route -> Supabase',
          'Cron -> API route -> Web Push',
        ].join('\n'),
      ),
    );
    expect(layout.rows).toEqual([
      ['PWA', 'Cron'],
      ['API route'],
      ['Gemini', 'Supabase', 'Web Push'],
    ]);
  });

  it('survives a loop', () => {
    const layout = layoutFlow(parseFlow(['A -> B -> C', 'C -> A'].join('\n')));
    expect(layout.rows.flat().sort()).toEqual(['A', 'B', 'C']);
  });
});
