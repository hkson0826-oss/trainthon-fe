import { Link } from 'react-router-dom';
import type { PublicFoundItem } from '@/contracts/types';
import { CATEGORY_LABEL } from '@/lib/categories';
import { FOUND_STATUS } from '@/lib/status';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ItemCard({ item }: { item: PublicFoundItem }) {
  return (
    <Link to={`/items/${item.id}`} className="card-surface flex flex-col gap-md no-underline">
      <div className="photo-frame">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="w-full" />
        ) : (
          <div className="flex h-3xl items-center justify-center caption">사진 없음</div>
        )}
      </div>
      <div className="flex items-start justify-between gap-md">
        <h2 className="typo-title-lg">{item.title}</h2>
        <StatusBadge view={FOUND_STATUS[item.status]} />
      </div>
      <p className="caption">
        {CATEGORY_LABEL[item.category]} · {item.placeLabel}
      </p>
      <p className="typo-body-md">{item.description}</p>
    </Link>
  );
}
