export enum Status {
  New,
  Ok,
  Timeout,
  InternalFailed,
}

export type Res = {
  status: Status;
  meta?: object;
  data?: any;
  message?: string;
};

export interface Handler {
  handle(res: Res): Promise<Res>;
  handleVerbosely?(res: Res): Promise<Res[]>;
}

export interface HandlerGetter {
  getHandler(name: string): Handler;
}

export interface HandlerBuilder {
  buildHandler(conf?: Map<string, any>): Handler;
}

export interface HandlerBuilderGetter {
  getBuilder(name: string): HandlerBuilder;
}
