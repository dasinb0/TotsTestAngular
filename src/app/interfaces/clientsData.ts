import { TotsListResponse } from '@tots/core';
import { Client } from '../entities/client';

export interface ClientsData {
  success: boolean;
  response: TotsListResponse<Client>;
}
