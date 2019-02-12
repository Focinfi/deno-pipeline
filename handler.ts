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
  handleVerbosely?(res: Res): Promise<Res[]>;
}

export interface HandlerBuilder {
  build(conf?: object): Handler;
}

export let handelrBuilders = new Map<string, HandlerBuilder>();
