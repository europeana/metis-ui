export interface LogStatus {
  externalTaskId?: string;
  topology: string;
  plugin: string;
  processed?: number;
  status?: string;
}
