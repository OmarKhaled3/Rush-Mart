'use client';

import { useState } from 'react';
import { menuData, type MenuCategory } from '@/data/menu';

interface MenuBoardProps {
  locale: string;
  translations: {
    priceLabel: string;
    note: string;
    colS: string;
    colL: string;
  };
}

function CategoryBoard({
  category,
  locale,
  colS,
  colL,
  priceLabel,
  note,
}: {
  category: MenuCategory;
  locale: string;
  colS: string;
  colL: string;
  priceLabel: string;
  note: string;
}) {
  const isTwoCol = category.type === 'two-col';
  const isLargeSet = category.items.length > 6;

  return (
    <div className="board">
      <div className="board-top">
        <span className="board-cat">
          {locale === 'ar' ? category.ar : category.en}
        </span>
        {isTwoCol ? (
          <div className="col-head">
            <span>{colS}</span>
            <span>{colL}</span>
          </div>
        ) : (
          <div className="col-head">
            <span>{priceLabel}</span>
          </div>
        )}
      </div>

      <div className={`rows${isTwoCol && isLargeSet ? ' two' : ''}`}>
        {category.items.map((item, i) => {
          const name = locale === 'ar' ? item.ar : item.en;

          if (isTwoCol) {
            return (
              <div className="row" key={i}>
                <span className="name">{name}</span>
                <span className="dots" aria-hidden="true" />
                <div className="prices">
                  <b className={item.small === null ? 'na' : ''}>
                    {item.small !== null ? item.small : '-'}
                  </b>
                  <b className="l">
                    {item.large !== null ? item.large : '-'}
                  </b>
                </div>
              </div>
            );
          } else {
            return (
              <div className="row" key={i}>
                <span className="name">{name}</span>
                <span className="dots" aria-hidden="true" />
                <div className="prices">
                  <b>{item.price !== null ? item.price : '-'}</b>
                </div>
              </div>
            );
          }
        })}
      </div>

      <p className="board-note">{note}</p>
    </div>
  );
}

export default function MenuBoard({ locale, translations }: MenuBoardProps) {
  const [activeTab, setActiveTab] = useState(menuData[0].id);

  const activeCategory = menuData.find((c) => c.id === activeTab) ?? menuData[0];

  return (
    <div>
      <div className="tabs">
        {menuData.map((cat) => (
          <button
            key={cat.id}
            className={`tab${activeTab === cat.id ? ' on' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {locale === 'ar' ? cat.ar : cat.en}
          </button>
        ))}
      </div>

      <CategoryBoard
        category={activeCategory}
        locale={locale}
        colS={translations.colS}
        colL={translations.colL}
        priceLabel={translations.priceLabel}
        note={translations.note}
      />
    </div>
  );
}
