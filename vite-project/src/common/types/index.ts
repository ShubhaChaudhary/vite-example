export interface Pagination {
    count: number;
    total_pages: number;
    current_page: number;
    prev_page?: number | null;
    next_page?: number | null;
    first_page: boolean;
    last_page: boolean;
  }
  
  export interface Feature {
    name: string;
    enabled: boolean;
    plans: string[];
    description?: string;
    limit: {
      units: string;
      usage: number | null;
      amount: number | null;
    };
  }
  
  export interface UpgradableFeature extends Feature {
    upgradable: boolean;
  }
  
  export type Settings = Record<string, string | number | boolean>;
  
  export * from './abilities';
  export * from './channels';
  export * from './contacts';
  export * from './events';
  export * from './meetings';
  export * from './moments';
  export * from './notes';
  export * from './shares';
  export * from './tags';
  export * from './tasks';
  export * from './teams';
  export * from './templates';
  export * from './transcript';
  export * from './users';