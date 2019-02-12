import { Handler, Pipe, PipeType, Res } from "./interfaces.ts";
import {
  buildPipe
  // handleWithTimeout
} from "./pipe.ts";

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
      res = await pipe.handler.handle(res);
    }
    return res;
  }

  /** Handle the res, return a list of Res for every step*/
  async handleVerbosely(res: Res): Promise<Res[]> {
    let reses = new Array();
    for (const pipe of this.pipes) {
      res = await pipe.handler.handle(res);
      reses.push(JSON.parse(JSON.stringify(res)));
    }
    return reses;
  }
}

export function buildLine(conf: any[], handlers?: Map<string, Handler>): Line {
  let line = new Line();

  for (const pipeConf of conf) {
    line.pipes.push(buildPipe(pipeConf, handlers));
  }

  return line;
}

export function buildLineWithJson(
  jsonConf: string,
  handlers?: Map<string, Handler>
): Line {
  const conf = JSON.parse(jsonConf);
  return buildLine(conf, handlers);
}
