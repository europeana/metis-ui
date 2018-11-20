export interface LogStatus {
  externaltaskId?: string;
  topology: string;
  plugin: string;
  processed?: number;
  status?: string;
}
