import {
  Handler,
  Res,
  Status,
  HandlerBuilder,
  handelrBuilders,
  buildLine
} from "https://deno.land/x/pipeline/mod.ts";

class BuilderSquare implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        res.data = res.data * res.data;
        return res;
      }
    };
  }
}
handelrBuilders.set("square", new BuilderSquare());

let conf = [
  {
    builderName: "square",
    timeout: 100,
    required: true
  }
];
let line = buildLine(conf);
line
  .handle({ status: Status.New, data: 2 })
  .then(res => console.log("data:", res.data))
  .catch(res => console.error(res.message));
// Output:
// data: 4

let handlers = new Map<string, Handler>([["my_square", line]]);
let refConf = [
  {
    refId: "my_square",
    timeout: 100,
    required: true
  },
  {
    builderName: "square",
    timeout: 100,
    required: true
  }
];

let refLine = buildLine(refConf, handlers);
refLine
  .handle({ status: Status.New, data: 2 })
  .then(res => console.log("ref line data:", res.data))
  .catch(res => console.error(res.message));
// Output:
// ref line data: 16

let parallelConf = [
  {
    refId: "my_square",
    timeout: 100,
    required: true
  },
  [
    {
      builderName: "square",
      timeout: 100,
      required: true
    },
    {
      builderName: "square",
      timeout: 100,
      required: true
    }
  ]
];

let parallelLine = buildLine(parallelConf, handlers);
parallelLine
  .handle({ status: Status.New, data: 2 })
  .then(res => console.log("parallel line data:", res.data))
  .catch(res => console.error(res.message));
// Output:
// parallel line data: [ 16, 16 ]

parallelLine
  .handleVerbosely({ status: Status.New, data: 2 })
  .then(reses =>
    reses.forEach((res, i) => console.log(i, "verbosely data:", res.data))
  )
  .catch(reses => console.error(reses));
// Output:
// 0 verbosely data: 4
// 1 verbosely data: [ 16, 16 ]
