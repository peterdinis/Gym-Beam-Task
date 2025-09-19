import { AxiosError } from 'axios';

/**
 * Custom type pre chyby volania Warehouse API
 */
export type WarehouseApiError = AxiosError | Error;
