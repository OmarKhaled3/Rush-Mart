import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/icons';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return (
    <>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <a
                href="https://maps.app.goo.gl/i4Ge3ruJBAjbMAkc9?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-red"
                style={{ alignSelf: 'flex-start' }}
              >
                {t('findUs')}
                <ArrowIcon className="arrow" />
              </a>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {t('hours')}
              </p>
              <a
                href={`mailto:${t('email')}`}
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: 'var(--red)',
                  borderBottom: '1px solid var(--red)',
                  paddingBottom: 2,
                  alignSelf: 'flex-start',
                }}
              >
                {t('email')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
