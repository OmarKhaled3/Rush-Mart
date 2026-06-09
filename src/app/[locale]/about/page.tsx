import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return (
    <section className="statement" style={{ borderTop: 'none' }}>
      <div className="wrap">
        <div className="statement-inner" style={{ maxWidth: 760 }}>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h2>{t('heading')}</h2>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 'clamp(16px, 1.6vw, 18px)',
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            {t('body1')}
          </p>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 'clamp(16px, 1.6vw, 18px)',
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            {t('body2')}
          </p>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 'clamp(16px, 1.6vw, 18px)',
              lineHeight: 1.7,
            }}
          >
            {t('body3')}
          </p>
        </div>
      </div>
    </section>
  );
}
