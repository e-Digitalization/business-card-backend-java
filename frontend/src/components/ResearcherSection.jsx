import React, { useMemo, useState } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolIcon from '@mui/icons-material/School';
import { cleanResearcher, hasCategory } from '../utils/cardCategories.js';
import { safeExternalUrl } from '../utils/profileLinks.js';

const PREVIEW_COUNT = 5;

// Name the destination instead of a generic "Full profile ↗" (the ↗ character turns into a blue emoji on iOS).
const profileLinkLabel = (href) => {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    if (host.includes('scholar.google')) return 'Google Scholar';
    if (host.endsWith('orcid.org')) return 'ORCID';
    if (host.endsWith('openalex.org')) return 'OpenAlex';
    if (host.endsWith('researchgate.net')) return 'ResearchGate';
  } catch {
    /* fall through */
  }
  return 'Full profile';
};
const CHART_YEARS = 10;

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const grouped = (value) => (/^\d+$/.test(String(value)) ? Number(value).toLocaleString('en-US') : value);

export const hasResearchContent = (profile) =>
  hasCategory(profile, 'researcher') && !cleanResearcher(profile?.researcherData).isEmpty;

// Public card section: Google-Scholar-style metrics, citations chart and papers.
const ResearcherSection = ({ profile, className = '' }) => {
  const [showAll, setShowAll] = useState(false);
  const data = useMemo(() => cleanResearcher(profile?.researcherData), [profile?.researcherData]);

  if (!hasCategory(profile, 'researcher') || data.isEmpty) return null;

  const scholarHref = safeExternalUrl(data.scholarUrl);
  // Long histories (e.g. OpenAlex returns decades) would be unreadable; chart the latest years.
  const chartYears = data.byYear.slice(-CHART_YEARS);
  const maxCount = Math.max(...chartYears.map((r) => r.count), 1);
  const papers = showAll ? data.publications : data.publications.slice(0, PREVIEW_COUNT);
  const sinceLabel = data.sinceYear ? `Since ${data.sinceYear.replace(/^since\s*/i, '')}` : 'Recent';

  return (
    <section className={`km-card-research ${className}`} aria-label="Research">
      <div className="km-card-videos-head">
        <h2 className="km-card-videos-title km-card-research-title">
          <SchoolIcon aria-hidden="true" sx={{ fontSize: 22 }} />
          Research
        </h2>
        {scholarHref && (
          <a href={scholarHref} target="_blank" rel="noreferrer" className="km-card-research-link">
            <span>{profileLinkLabel(scholarHref)}</span>
            <OpenInNewIcon aria-hidden="true" sx={{ fontSize: 15 }} />
          </a>
        )}
      </div>

      {data.interests.length > 0 && (
        <div className="km-card-research-tags">
          {data.interests.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {data.metricRows.length > 0 && (
        <table className="km-card-research-metrics">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">All</th>
              <th scope="col">{sinceLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.metricRows.map(([label, all, since]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{grouped(all) || '–'}</td>
                <td>{grouped(since) || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {chartYears.length > 0 && (
        <figure className="km-card-research-chart" aria-label="Citations per year">
          <div className="km-card-research-bars">
            {chartYears.map((row, index) => (
              <div key={row.year} className="km-card-research-bar" title={`${row.year}: ${row.count}`}>
                <span className="km-card-research-bar-count">{compact.format(row.count)}</span>
                <span className="km-card-research-bar-fill" style={{ height: `${Math.max((row.count / maxCount) * 100, 3)}%` }} />
                <span className="km-card-research-bar-year">
                  {/* Many bars: use 'YY and label every other year (always the last) so they don't collide. */}
                  {chartYears.length <= 8
                    ? row.year
                    : (chartYears.length - 1 - index) % (chartYears.length > 12 ? 2 : 1) === 0
                      ? `'${row.year.slice(-2)}`
                      : ''}
                </span>
              </div>
            ))}
          </div>
        </figure>
      )}

      {data.publications.length > 0 && (
        <>
          <ul className="km-card-research-papers">
            {papers.map((p, i) => {
              const href = safeExternalUrl(p.url);
              return (
                <li key={`${p.title}-${i}`}>
                  <div className="km-card-research-paper-main">
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className="km-card-research-paper-title">
                        {p.title}
                      </a>
                    ) : (
                      <span className="km-card-research-paper-title">{p.title}</span>
                    )}
                    {p.authors && <p className="km-card-research-paper-meta">{p.authors}</p>}
                    {p.venue && <p className="km-card-research-paper-meta">{p.venue}</p>}
                  </div>
                  <div className="km-card-research-paper-side">
                    {p.citedBy && <span className="km-card-research-cited">{grouped(p.citedBy)}</span>}
                    {p.year && <span>{p.year}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          {data.publications.length > PREVIEW_COUNT && (
            <button type="button" className="km-card-research-more" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Show fewer papers' : `Show all ${data.publications.length} papers`}
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default ResearcherSection;
