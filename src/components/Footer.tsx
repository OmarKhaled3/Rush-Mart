import { getTranslations } from 'next-intl/server';
import { BoltIcon } from '@/components/icons';

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer>
      <div className="wrap">
        <div className="foot-inner">
          <div className="brand" style={{ fontSize: 17 }}>
            <span className="r">RUSH</span>
            <BoltIcon className="bolt" width={15} height={15} style={{ color: 'var(--gold)' }} />
            <span>MART</span>
          </div>
          <span>{t('footer.tagline')}</span>
        </div>
      </div>
    </footer>
  );
}
