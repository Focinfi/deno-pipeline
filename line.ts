import { Handler, Pipe, PipeType, Res, Status } from "./interfaces.ts";
import { handelrBuilders } from "./builders.ts";
import { buildPipe, handleWithTimeout } from "./pipe.ts";
import { buildParallel } from "./parallel.ts";

export class Line implements Handler {
  pipes: Pipe[];

  constructor() {
    this.pipes = new Array<Pipe>();
  }

  /**
   * Handle the res, run pipes one by one.
   * Run Single Pipe with timeout.
   * Run Parallel Pipe directly.
   */
  async handle(res: Res): Promise<Res> {
    for (const pipe of this.pipes) {
      if (pipe.type == PipeType.Single) {
        res = await handleWithTimeout(pipe, res);
        continue
      }

      res = await pipe.handler.handle(res);
    }
    return res;
  }
}

export function buildLine(conf: any[], handlers?: Map<string, Handler>): Line {
  let line = new Line();

  for (const pipeConf of conf) {
    line.pipes.push(buildPipe(pipeConf, handlers));
  }

  return line;
}

export function buildLineWithJson(jsonConf: string, handlers?: Map<string, Handler>): Line {
  const conf = JSON.parse(jsonConf)
  return buildLine(conf, handlers);
}