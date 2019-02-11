import { Handler, Pipe, PipeType, Res, Status } from "./interfaces.ts";
import { handelrBuilders } from "./builders.ts";
import { buildPipe, handleWithTimeout } from "./pipe.ts";
import { buildParallel } from "./parallel.ts";

export class Line implements Handler {
  pipes: Pipe[];

  constructor () {
    this.pipes = new Array<Pipe>();
  }

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

export function buildLineWithJson(jsonConf: string, handlers: Map<string, Handler>): Line {
  const conf = JSON.parse(jsonConf)
  return buildLine(conf, handlers);
}

export function buildLine(conf: any[], handlers: Map<string, Handler>): Line {
  let line = new Line();

  for (const pipeConf of conf) {
    // build a parallel 
    if (Array.isArray(pipeConf)) {
      const handler = buildParallel(pipeConf, handlers);
      line.pipes.push({
        type: PipeType.Parallel,
        conf: null,
        handler: handler
      });
      continue;
    }

    // build a single pipe
    line.pipes.push(buildPipe(pipeConf, handlers));
  }

  return line;
}

const handlers = new Map<string, Handler>();
handlers.set('echo-demo', handelrBuilders.get('echo').build());
handlers.set('square-demo', handelrBuilders.get('square').build());

const testConf = [
  {
    refId: "square-demo",
    timeout: 500,
    required: false,
    defaultValue: 3
  },
  {
    timeout: 500,
    required: false,
    defaultValue: 4,
    builderName: "square"
  },
  [
    {
      timeout: 1500,
      required: true,

      builderName: "delay",
      builderConf: {
        delay: 1000,
      }
    },
    {
      timeout: 2000,
      required: false,
      defaultValue: 1,
      builderName: "delay",
      builderConf: {
        delay: 1000,
      }
    },
    {
      timeout: 2000,
      required: false,
      defaultValue: 2,
      builderName: "delay",
      builderConf: {
        delay: 1000,
      }
    }
  ],
]

const line = buildLineWithJson(JSON.stringify(testConf), handlers);

console.log(new Date());
line.handle({ status: Status.New, data: 3 })
  .then((res) => console.log(res, new Date()))
  .catch((err) => console.log("err:", err, new Date()));

