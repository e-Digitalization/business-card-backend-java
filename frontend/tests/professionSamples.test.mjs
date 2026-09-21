import test from 'node:test';
import assert from 'node:assert/strict';
import { PROFESSION_SAMPLES, sampleVcard } from '../src/utils/professionSamples.js';
import { cleanResearcher, cleanBanker, cleanGovernment } from '../src/utils/cardCategories.js';

test('each profession has unique identity and substantive content for the public renderer', () => {
  assert.equal(PROFESSION_SAMPLES.length, 5);
  assert.equal(new Set(PROFESSION_SAMPLES.map(s => s.id)).size, 5);
  assert.equal(new Set(PROFESSION_SAMPLES.map(s => s.profile.fullName)).size, 5);
  for (const { profile } of PROFESSION_SAMPLES) {
    assert.match(profile.email, /\.example$/);
    if (profile.categories === 'researcher') {
      const research = cleanResearcher(profile.researcherData);
      assert.ok(research.metricRows.length && research.byYear.length && research.publications.length);
    } else if (profile.categories === 'banker') {
      assert.ok(cleanBanker(profile.bankerData).services.length);
    } else {
      const office = cleanGovernment(profile.governmentData);
      assert.ok(office.hasOffice && office.hasEvents);
    }
  }
});

test('demo contact download is self-contained and escapes vCard delimiters', () => {
  const uri = sampleVcard({ fullName: 'Test; Person, One', company: 'Line one\nLine two', title: 'A\\B', email: 'person@example.test' });
  assert.ok(uri.startsWith('data:text/vcard;charset=utf-8,'));
  const data = decodeURIComponent(uri.split(',')[1]);
  assert.ok(data.includes('FN:Test\\; Person\\, One\r\n'));
  assert.ok(data.includes('N:;Test\\; Person\\, One;;;\r\n'));
  assert.ok(data.includes('ORG:Line one\\nLine two\r\n'));
  assert.ok(data.includes('TITLE:A\\\\B\r\n'));
  assert.ok(data.endsWith('END:VCARD\r\n'));
  assert.ok(!uri.includes('/undefined/'));
});
