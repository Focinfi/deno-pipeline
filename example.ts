import {
  Res,
  Handler,
  Status,
  buildLine,
  HandlerBuilder,
} from "https://deno.land/x/pipeline@v1.1.2/mod.ts";

const builders = {
  getBuilder(name: string): HandlerBuilder {
    return {
      buildHandler(): Handler {
        return {
          async handle(res: Res): Promise<Res> {
            return {
              status: Status.Ok,
              data: res.data * res.data,
              meta: res.meta,
            } as Res;
          },
        };
      },
    };
  },
};

let conf = [
  {
    builderName: "square",
    timeout: 100,
    required: true,
  },
];
let line = buildLine(conf, builders);
line
  .handle({ status: Status.New, data: 2 })
  .then((res) => console.log(`data: ${res.data}`))
  .catch((res) => console.error(res.message));
// Output:
// data: 4

let refConf = [
  {
    refId: "my_square",
    timeout: 100,
    required: true,
  },
  {
    builderName: "square",
    timeout: 100,
    required: true,
  },
];

const handlers = {
  getHandler(name: string): Handler {
    return builders.getBuilder("square").buildHandler();
  },
};

let refLine = buildLine(refConf, builders, handlers);
refLine
  .handle({ status: Status.New, data: 2 })
  .then((res) => console.log(`ref line data: ${res.data}`))
  .catch((res) => console.error(res.message));
// Output:
// ref line data: 16

let parallelConf = [
  {
    refId: "my_square",
    timeout: 100,
    required: true,
  },
  [
    {
      builderName: "square",
      timeout: 100,
      required: true,
    },
    {
      builderName: "square",
      timeout: 100,
      required: true,
    },
  ],
];

let parallelLine = buildLine(parallelConf, builders, handlers);
parallelLine
  .handle({ status: Status.New, data: 2 })
  .then((res) => console.log(`parallel line data: ${res.data}`))
  .catch((res) => console.error(res.message));
// Output:
// parallel line data: 16, 16]

parallelLine
  .handleVerbosely({ status: Status.New, data: 2 })
  .then((reses) =>
    reses.forEach((res, i) =>
      console.log(`pipe[${i + 1}] response: ${res.data}`)
    )
  )
  .catch((reses) => console.error(reses));
// Output:
// pipe[1] response: 4
// pipe[2] response: 16,16
