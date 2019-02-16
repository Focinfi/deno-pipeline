import { Handler, Res, Status, handelrBuilders } from "./handler.ts";
import { newPipeConfWithObject } from "./pipe_conf.ts";
import { buildParallel } from "./parallel.ts";
import { delay } from "./util.ts";

export const ErrRefHandlerNotFound = new Error("ref handler not found");
export const ErrRefBuilderNotFound = new Error("ref builder not found");

export enum PipeType {
  Single,
  Parallel
}

export interface PipeConf {
  timeout: number;
  required: boolean;
  defaultValue?: any;
}

export class Pipe implements Handler {
  type: PipeType;
  conf: PipeConf;
  handler: Handler;
  refId?: string;
  builderName?: string;
  builderConf?: object;
  desc?: string;

  constructor(conf: object, handlers?: Map<string, Handler>) {
    if (Array.isArray(conf)) {
      const handler = buildParallel(conf, handlers);
      this.type = PipeType.Parallel;
      this.handler = handler;
      return;
    }

    const pc = newPipeConfWithObject(conf);

    if ("refId" in conf) {
      if (!handlers || !handlers.has(conf["refId"])) {
        throw ErrRefHandlerNotFound;
      }

      this.refId = conf["refId"];
      this.type = PipeType.Single;
      this.conf = pc;
      this.handler = handlers.get(conf["refId"]);
      return;
    }

    if (!handelrBuilders.has(conf["builderName"])) {
      throw ErrRefBuilderNotFound;
    }

    this.type = PipeType.Single;
    this.conf = pc;
    this.handler = handelrBuilders
      .get(conf["builderName"])
      .build(conf["builderConf"]);
    this.builderConf = conf["builderConf"];
    this.desc = conf["desc"];
  }

  async handle(res: Res): Promise<Res> {
    // run handler.handle directly for a Parallel Pipe
    if (this.type == PipeType.Parallel) {
      return this.handler.handle(res);
    }
    let rt: Res = {
      status: Status.New,
      data: res.data,
      meta: res.meta
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
          message: "timeout"
        };
      }
    } catch (e) {
      rt = {
        status: Status.InternalFailed,
        message: e.toString()
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
