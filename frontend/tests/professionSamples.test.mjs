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
    assert.match(profile.photoUrl, /\/demo\/[a-z]+\.png$/);
    assert.ok(profile.bio.length > 100);
    assert.ok(profile.expertise.length >= 3);
    assert.ok(profile.qualifications.length >= 2);
    assert.ok(profile.languages.length >= 2);
    assert.ok(profile.officeHours && profile.officeAddress && profile.phone);
    const vcard = decodeURIComponent(sampleVcard(profile).split(',')[1]);
    assert.ok(vcard.includes(`TEL:${profile.phone}`));
    assert.ok(vcard.includes(`URL:${profile.website}`));
    if (profile.categories === 'researcher') {
      const research = cleanResearcher(profile.researcherData);
      assert.ok(research.metricRows.length && research.byYear.length && research.publications.length);
    } else if (profile.categories === 'banker') {
      const bank = cleanBanker(profile.bankerData);
      assert.ok(bank.services.length && bank.hasAds);
    } else {
      const office = cleanGovernment(profile.governmentData);
      assert.ok(office.hasOffice && office.hasEvents);
      assert.ok(office.events.length >= 2);
      for (const event of office.events) {
        assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(event.imageUrl && event.venue && event.description.length > 80);
      }
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
