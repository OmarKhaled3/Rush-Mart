import { offersData } from '@/data/offers';

interface OffersSectionProps {
  locale: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  egp: string;
}

export default function OffersSection({ locale, eyebrow, heading1, heading2, egp }: OffersSectionProps) {
  const isAr = locale === 'ar';

  return (
    <section className="offers" id="offers">
      <div className="wrap">
        <div className="offers-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2>
            {heading1}
            <span className="red">{heading2}</span>
          </h2>
        </div>

        <div className="offers-grid">
          {offersData.map((offer) => {
            const name = isAr ? offer.ar : offer.en;
            const restriction = offer.restriction
              ? isAr ? offer.restriction.ar : offer.restriction.en
              : null;
            const limited = offer.limited
              ? isAr ? offer.limited.ar : offer.limited.en
              : null;
            const isFeatured = offer.badge !== null;

            if (isFeatured) {
              return (
                <article key={offer.id} className="offer-card featured">
                  <div className="offer-card-body">
                    <div className="offer-top">
                      <span className="offer-num">{offer.num}</span>
                      <span className="offer-name">{name}</span>
                    </div>
                    {restriction && (
                      <span className="offer-tag gold">{restriction}</span>
                    )}
                    <ul className="offer-items">
                      {offer.items.map((item, i) => (
                        <li key={i}>{isAr ? item.ar : item.en}</li>
                      ))}
                    </ul>
                    {limited && <p className="offer-limited">{limited}</p>}
                  </div>
                  <div className="offer-badge">{offer.badge}</div>
                </article>
              );
            }

            return (
              <article key={offer.id} className="offer-card">
                <div className="offer-top">
                  <span className="offer-num">{offer.num}</span>
                  <span className="offer-name">{name}</span>
                </div>
                {restriction && (
                  <span className="offer-tag gold">{restriction}</span>
                )}
                <ul className="offer-items">
                  {offer.items.map((item, i) => (
                    <li key={i}>{isAr ? item.ar : item.en}</li>
                  ))}
                </ul>
                <div className="offer-bottom">
                  <div className="offer-price">
                    {offer.price}
                    <sup>{egp}</sup>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
