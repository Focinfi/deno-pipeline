import {
  Handler,
  Res,
  HandlerBuilder,
  Status,
  handlerBuilders,
} from "./handler.ts";
import { delay } from "https://deno.land/std/async/delay.ts";

class BuilderEcho implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        return new Promise((resolve) => resolve(res));
      },
    };
  }
}

class BuilderSquare implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        return {
          status: Status.Ok,
          data: res.data * res.data,
          meta: res.meta,
        };
      },
    };
  }
}

class BuilderDelay implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        if (conf) {
          await delay(conf.get("delay"));
        }
        return res;
      },
    };
  }
}

class BuilderFailed implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        throw new Error("failed");
      },
    };
  }
}

export function mockHandlerBuilders() {
  handlerBuilders.set("echo", new BuilderEcho());
  handlerBuilders.set("square", new BuilderSquare());
  handlerBuilders.set("delay", new BuilderDelay());
  handlerBuilders.set("failed", new BuilderFailed());
}
