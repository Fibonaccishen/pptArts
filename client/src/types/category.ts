export interface CategoryNode {
  key: string;
  title: string;
  children?: CategoryNode[];
  count?: number;
}
