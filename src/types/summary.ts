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

export interface SummaryData {
  meta: {
    generatedAt: string;
    application: string;
  };
  structure: {
    preTextual: string[];
    body: Array<{
      order: number;
      id: string;
      title: string;
      type: TocItemType;
    }>;
    postTextual: string[];
  };
}