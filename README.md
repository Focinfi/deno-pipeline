## deno-pipeline

Configurable data pipeline in Deno.

[Examples](https://github.com/Focinfi/deno-pipeline/blob/master/example.ts)

Data processing defined by `Handler`s like Unix pipeline. 

```typescript
export type Res {
  status: Status;
  meta?: object;
  data?: any;
  message?: string;
}

export interface Handler {
  handle(res: Res): Promise<Res>;
  handleVerbosely?(res: Res): Promise<Res[]>;
}
```

Based on the `Handler`, we need to make some tools:
1. `HandlerBuilder`: build a `Handler` with config.
```typescript
  export interface HandlerBuilder {
    buildHandler(conf?: Map<string, any>): Handler;
  }
```
2. `Pipe`:
    1. wraps a `Handler` with options: `timeout`/`required`/`defaultValue`. 
    2. A Pipe can build with a `HandlerBuilder` or referenced by a existing `Handler`.
    3. Throws error when `Handler` timeout or failed.
    4. Use the `defaultValue` when a not `required` `Handler` failed or timout.
3. `Parallel`: 
    1. contains a list of `Pipe`, handles the pipes concurrently.
    2. A `Parallel` is a `Handler`.

3. `Line`:
    1. contains a list of `Pipe`, handles the pipes sequentially.
    2. A `Line` is a `Handler`.


### Define a `HandlerBuilder` and set it to `handlerBuilders`
```typescript
import {
  Handler,
  Res,
  Status,
  HandlerBuilder,
  buildLine
} from "https://deno.land/x/pipeline/mod.ts";

class BuilderSquare implements HandlerBuilder {
  buildHandler(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        res.data = res.data * res.data;
        return res;
      }
    };
  }
}
const testBuilders = {
  getBuilder(name: string): HandlerBuilder {
    const builder = new Map<string, HandlerBuilder>([
      ["square", HandlerBuilderSquare],
    ]).get(name);
    if (!builder) {
      throw Error("builder not found");
    }
    return builder;
  },
};
```

### Build a `Line` with config
1. `builderName`: key in `TestBuilders`
2. `builderConf`: pass to `HandlerBuilder` to build a `Handler`

```typescript
let conf = [
  {
    builderName: "square",
    timeout: 100,
    required: true
  }
];
let line = buildLine(conf, testBuilders);
line
  .handle({ status: Status.New, data: 2 })
  .then(res => console.log("data:", res.data))
  .catch(res => console.error(res.message));
// Output:
// data: 4
```

### Build a `Line` contains a referenced `Handler`
1. `refName`: the name of exsiting `Handler` in the `handlers`

```typescript
const handlers = {
  getHandler(name: string): Handler {
    return builders.getBuilder("square").buildHandler();
  },
};
let refConf = [
  {
    refName: "my_square",
    timeout: 100,
    required: true
  },
  {
    builderName: "square",
    timeout: 100,
    required: true
  }
];

let refLine = buildLine(refConf, testBuilders, handlers);
refLine
  .handle({ status: Status.New, data: 2 })
  .then(res => console.log("ref line data:", res.data))
  .catch(res => console.error(res.message));
// Output:
// ref line data: 16
```

### Build a `Line` contains parallel pipes
Array Item will act as a `Parallel`, return a list of data returned by every pipe.

```typescript
let parallelConf = [
  {
    refName: "my_square",
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

let parallelLine = buildLine(parallelConf, testBuilders, handlers);
parallelLine
  .handle({ status: Status.New, data: 2 })
  .then(res => console.log("parallel line data:", res.data))
  .catch(res => console.error(res.message))
// Output:
// parallel line data: [ 16, 16 ]
```

### `handleVerbosely`
Returns a list of `Res` returned by every pipe; 

```typescript
parallelLine
  .handleVerbosely({ status: Status.New, data: 2 })
  .then(reses =>
    reses.forEach((res, i) => console.log(i, "verbosely data:", res.data))
  )
  .catch(reses => console.error(reses));
// Output:
// 0 verbosely data: 4
// 1 verbosely data: [ 16, 16 ]
```
