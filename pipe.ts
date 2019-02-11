import {
  Handler,
  Pipe,
  PipeType,
  Res,
  Status
} from "./interfaces.ts";
import { handelrBuilders } from "./builders.ts";
import { newPipeConfWithObject } from "./pipe_conf.ts";
import { buildParallel } from "./parallel.ts";
import { delay } from "./util.ts";

export const ErrRefHandlerNotFound = new Error('ref handler not found');
export const ErrRefBuilderNotFound = new Error('ref builder not found');

export function buildPipe(conf: object, handlers?: Map<string, Handler>): Pipe {
  if (Array.isArray(conf)) {
    const handler = buildParallel(conf, handlers);
    return {
      type: PipeType.Parallel,
      conf: null,
      handler: handler
    }
  }

  const pc = newPipeConfWithObject(conf);

  if ('refId' in conf) {
    if (!handlers || !handlers.has(conf['refId'])) {
      throw ErrRefHandlerNotFound;
    }

    return {
      type: PipeType.Single,
      conf: pc,
      handler: handlers.get(conf['refId'])
    }
  }

  if (!handelrBuilders.has(conf['builderName'])) {
    throw ErrRefBuilderNotFound;
  }

  return {
    type: PipeType.Single,
    conf: pc,
    handler: handelrBuilders.get(conf['builderName']).build(conf['builderConf'])
  }
}

/** Handle res, throws err when failed/timeout and conf.required is true. */
export async function handleWithTimeout(pipe: Pipe, res: Res): Promise<Res> {
  let rt: Res = {
    status: Status.New,
    data: res.data,
    meta: res.meta
  };
  try {
    const timer = delay(pipe.conf.timeout);
    const handler = pipe.handler.handle(rt);
    let r = await Promise.race([timer, handler]);
    if (r) {
      rt = r as Res;
      rt.status = Status.Ok;
    } else {
      rt = {
        status: Status.Timeout,
        message: "timeout"
      }
    }
  }
  catch (e) {
    rt = {
      status: Status.InternalFailed,
      message: e.toString()
    }
  }

  if (pipe.conf.required && rt.status != Status.Ok) {
    throw rt;
  }

  if (rt.status != Status.Ok) {
    rt.data = pipe.conf.defaultValue;
  }
  return rt;
}