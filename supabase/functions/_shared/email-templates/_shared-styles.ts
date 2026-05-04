// Shared brand styles for Find Your Top Talent auth emails.
// Dark marine blue background, gold accents, white body for deliverability.
// (Day 58+ Sasha 2026-05-03: brand mark unified across all transactional
// surfaces — was "Genius Business", now "Find Your Top Talent".)

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
}

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0',
}

export const header = {
  backgroundColor: '#041a2f',
  padding: '40px 32px 32px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}

export const brandMark = {
  fontSize: '11px',
  fontWeight: 700 as const,
  letterSpacing: '4px',
  color: '#f0c27f',
  textTransform: 'uppercase' as const,
  margin: 0,
}

export const body = {
  backgroundColor: '#ffffff',
  padding: '40px 32px',
  borderLeft: '1px solid #e8eaed',
  borderRight: '1px solid #e8eaed',
}

export const h1 = {
  fontSize: '24px',
  fontWeight: 700 as const,
  color: '#041a2f',
  margin: '0 0 20px',
  letterSpacing: '-0.3px',
  lineHeight: 1.3,
}

export const text = {
  fontSize: '15px',
  color: '#3a4a5c',
  lineHeight: 1.6,
  margin: '0 0 24px',
}

export const link = { color: '#041a2f', textDecoration: 'underline' }

export const button = {
  backgroundColor: '#041a2f',
  color: '#f0c27f',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '999px',
  padding: '14px 32px',
  textDecoration: 'none',
  letterSpacing: '0.3px',
  display: 'inline-block',
}

export const codeStyle = {
  fontFamily: "'SF Mono', Menlo, Courier, monospace",
  fontSize: '28px',
  fontWeight: 700 as const,
  color: '#041a2f',
  letterSpacing: '6px',
  textAlign: 'center' as const,
  backgroundColor: '#f7f5f0',
  padding: '20px',
  borderRadius: '8px',
  margin: '0 0 30px',
}

export const footerWrap = {
  backgroundColor: '#f7f5f0',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderRadius: '0 0 12px 12px',
  border: '1px solid #e8eaed',
  borderTop: 'none',
}

export const footer = {
  fontSize: '12px',
  color: '#7a8896',
  margin: 0,
  lineHeight: 1.5,
}
