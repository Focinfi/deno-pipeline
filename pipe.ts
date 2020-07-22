import { Handler, Res, Status, handlerBuilders } from "./handler.ts";
import { buildParallel } from "./parallel.ts";
import { delay } from "https://deno.land/std/async/mod.ts";

export const ErrRefHandlerNotFound = new Error("ref handler not found");
export const ErrRefBuilderNotFound = new Error("ref builder not found");

export enum PipeType {
  Single,
  Parallel,
}

export type PipeConf = {
  timeout: number;
  required: boolean;
  defaultValue?: any;
};

export type confInfo = {
  refId?: string;
  builderName?: string;
  builderConf?: Map<string, any>;
  desc?: string;
  timeout: number;
  required: boolean;
  defaultValue?: any;
};

export class Pipe implements Handler {
  type: PipeType;
  conf: PipeConf;
  handler: Handler;
  refId?: string;
  builderName?: string;
  builderConf?: Map<string, any>;
  desc?: string;

  constructor(c: confInfo | confInfo[], handlers?: Map<string, Handler>) {
    if (Array.isArray(c)) {
      const handler = buildParallel(c, handlers);
      this.conf = { timeout: 10000, required: true };
      this.type = PipeType.Parallel;
      this.handler = handler;
      return;
    }

    if (!c.required && !c.defaultValue) {
      throw Error("default value not set when a pipe is required");
    }
    this.conf = c as PipeConf;
    this.refId = c.refId;
    this.builderName = c.builderName;
    this.builderConf = c.builderConf;
    this.desc = c.desc;

    if (c.refId) {
      if (!handlers) {
        throw ErrRefHandlerNotFound;
      }
      const handler = handlers.get(c.refId);
      if (!handler) {
        throw ErrRefHandlerNotFound;
      }

      this.type = PipeType.Single;
      this.handler = handler;
      return;
    }

    if (!c.builderName) {
      throw ErrRefBuilderNotFound;
    }
    const builder = handlerBuilders.get(c.builderName);
    if (!builder) {
      throw ErrRefBuilderNotFound;
    }
    this.type = PipeType.Single;
    this.handler = builder.build(c.builderConf);
  }

  async handle(res: Res): Promise<Res> {
    // run handler.handle directly for a Parallel Pipe
    if (this.type == PipeType.Parallel) {
      return await this.handler.handle(res);
    }
    let rt: Res = {
      status: Status.New,
      data: res.data,
      meta: res.meta,
    };
    try {
      const timer = delay(this.conf.timeout);
      const handler = this.handler.handle(rt);
      let r = await Promise.race([timer, handler]);
      if (r) {
        rt = r as Res;
        rt.status = Status.Ok;
      } else {
        rt = {
          status: Status.Timeout,
          message: "timeout",
        };
      }
    } catch (e) {
      rt = {
        status: Status.InternalFailed,
        message: e.toString(),
      };
    }

    if (this.conf.required && rt.status != Status.Ok) {
      throw rt;
    }

    if (rt.status != Status.Ok) {
      rt.data = this.conf.defaultValue;
    }
    return rt;
  }
}
