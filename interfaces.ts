export enum Status {
  New,
  Ok,
  Timeout,
  InternalFailed
}

export interface Res {
  status: Status;
  meta?: object;
  data?: any;
  message?: string;
}

export interface Handler {
  handle(res: Res): Promise<Res>;
}

export interface HandlerBuilder {
  build(conf?: object): Handler;
}

export enum PipeType {
  Single,
  Parallel
}

export interface PipeConf {
  timeout: number;
  required: boolean;
  defaultValue?: any;
}

export interface Pipe {
  type: PipeType;
  conf: PipeConf;
  handler: Handler;
}