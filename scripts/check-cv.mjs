// Checks both public CVs against specs/04-pages.md ("CV publik"): no phone number, no
// forbidden keywords, and a working PDF download. Run with `npm run check-cv` after every
// change to the CV documents. Needs the network, so it is not part of CI.
import { cvLinks } from '../src/content/cv.ts';

const FORBIDDEN = ['E-Klaim', 'EKlaim', 'INA-CBG', 'INACBG', 'iDRG', 'SIMRS', 'BPJS'];
// Indonesian mobile numbers: 08…, 628…, or +62 8…, with optional spaces, dots, or dashes.
const PHONE = /(?:\+?62|\b0)[\s.-]*8[\d\s.-]{7,14}\d/;

let failed = false;
for (const lang of ['id', 'en']) {
  const links = cvLinks(lang);
  const problems = [];

  const text = await fetch(links.text);
  if (!text.ok) problems.push(`text export answered ${text.status}`);
  else {
    const body = await text.text();
    if (PHONE.test(body)) problems.push('contains a phone number');
    for (const word of FORBIDDEN)
      if (body.toLowerCase().includes(word.toLowerCase())) problems.push(`contains "${word}"`);
  }

  const pdf = await fetch(links.pdf);
  const type = pdf.headers.get('content-type') ?? '';
  if (!pdf.ok || !type.includes('application/pdf'))
    problems.push(`PDF download answered ${pdf.status} ${type}`);
  await pdf.body?.cancel();

  if (problems.length) {
    failed = true;
    console.error(`check-cv: ${lang} FAILED: ${problems.join('; ')}`);
  } else console.log(`check-cv: ${lang} ok`);
}
if (failed) process.exit(1);
