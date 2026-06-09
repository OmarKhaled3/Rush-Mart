import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.careers' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.careers' });

  return (
    <section className="statement" style={{ borderTop: 'none' }}>
      <div className="wrap">
        <div className="statement-inner" style={{ maxWidth: 680 }}>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h2>{t('heading')}</h2>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 'clamp(16px, 1.6vw, 18px)',
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            {t('body')}
          </p>
          <a
            href={`mailto:${t('email')}`}
            style={{
              display: 'inline-block',
              fontWeight: 600,
              fontSize: 16,
              color: 'var(--red)',
              borderBottom: '1px solid var(--red)',
              paddingBottom: 2,
            }}
          >
            {t('email')}
          </a>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 13,
              marginTop: 20,
              letterSpacing: '.04em',
            }}
          >
            {t('note')}
          </p>
        </div>
      </div>
    </section>
  );
}
