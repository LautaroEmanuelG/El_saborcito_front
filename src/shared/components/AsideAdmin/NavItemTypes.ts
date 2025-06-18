// NavItemTypes.ts

export interface SubItem {
  to: string;
  label: string;
  hasActions?: boolean;
}

export interface NavItemStructure {
  title: string;
  subItems?: SubItem[];
  children?: NavItemStructure[];
}
