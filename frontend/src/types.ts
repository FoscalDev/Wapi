export type DashboardSummary = {
  incoming_messages: number;
  routing_success: number;
  routing_failed: number;
  avg_latency_ms: number;
};

export type WhatsappConfig = {
  _id: string;
  app_name: string;
  phone_number_id: string;
  display_phone_number: string;
  webhook_url: string;
  auth_type: 'NONE' | 'BEARER' | 'API_KEY';
  auth_token?: string;
  is_active: boolean;
};

export type MessageLog = {
  _id: string;
  phone_number_id: string;
  display_phone_number: string;
  from: string;
  message_type: string;
  message_content: string;
  raw_payload: Record<string, unknown>;
  received_at: string;
};

export type RoutingLog = {
  _id: string;
  phone_number_id: string;
  target_webhook: string;
  app_name: string;
  status: 'pending' | 'success' | 'failed';
  http_status?: number;
  request_body?: Record<string, unknown>;
  response_body?: Record<string, unknown>;
  error_message?: string;
  attempts: number;
  latency_ms?: number;
  processed_at: string;
};

export type AppPermission =
  | 'dashboard.read'
  | 'configs.manage'
  | 'logs.read'
  | 'logs.manage'
  | 'settings.manage'
  | 'users.manage'
  | '*';

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  permissions: AppPermission[];
  can_access: boolean;
};
