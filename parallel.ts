import { Handler, Res, Status } from "./handler.ts";
import { Pipe } from "./pipe.ts";

export class Parallel implements Handler {
  pipes: Pipe[];

  constructor() {
    this.pipes = new Array<Pipe>();
  }

  /** Handle the res, run pipes concrrently */
  async handle(res: Res): Promise<Res> {
    let reses = await Promise.all(
      this.pipes.map(pipe => {
        return pipe.handle(res);
      })
    );

    return {
      status: Status.Ok,
      data: reses.map(res => res.data)
    };
  }
}

export function buildParallel(
  conf: any[],
  handlers?: Map<string, Handler>
): Parallel {
  let parallel = new Parallel();
  for (let pipeConf of conf) {
    const pipe = new Pipe(pipeConf, handlers);
    parallel.pipes.push(pipe);
  }

  return parallel;
}

export function buildParallelWithJson(
  jsonConf: string,
  handlers?: Map<string, Handler>
): Parallel {
  const conf = JSON.parse(jsonConf);
  return buildParallel(conf, handlers);
}
