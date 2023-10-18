export interface Model {
    id: string | number;
    encoded_id: string;
  }
  
  export interface Settings {
    [key: string]: string | number | boolean;
  }