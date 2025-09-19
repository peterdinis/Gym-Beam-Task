
declare namespace NodeJS {
  interface ProcessEnv {
    readonly WAREHOUSE_API_BASE_URL: string;
    readonly WAREHOUSE_API_KEY: string;
    readonly PORT?: number;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}