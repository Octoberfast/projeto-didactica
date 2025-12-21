
export type TocItemType = 'chapter' | 'subchapter' | 'internal-subchapter' | 'recap';

export interface TocItem {
  id: string;
  title: string;
  type: TocItemType;
}

export interface DocumentInfo {
  title: string;
  author: string;
}

export interface FixedSection {
  id: string;
  label: string;
  selected: boolean;
}
