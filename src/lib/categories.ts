export const CATEGORY_LABEL: Record<string, string> = {
  ELECTRONICS: '전자기기',
  CLOTHING: '의류',
  KEYS: '열쇠',
  WALLET: '지갑',
  ID_CARD: '신분증',
  BOOKS: '도서',
  ACCESSORIES: '액세서리',
  OTHER: '기타',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
  value,
  label,
}));
