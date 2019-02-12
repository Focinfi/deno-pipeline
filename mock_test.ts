import {
  Handler,
  Res,
  HandlerBuilder,
  Status,
  handelrBuilders
} from "./handler.ts";
import { delay } from "./util.ts";

class BuilderEcho implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        return new Promise(resolve => resolve(res));
      }
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
          meta: res.meta
        };
      }
    };
  }
}

class BuilderDelay implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        if (conf) {
          await delay(conf["delay"]);
        }
        return res;
      }
    };
  }
}

class BuilderFailed implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        throw new Error("failed");
      }
    };
  }
}

export function mockHandelrBuilders() {
  handelrBuilders.set("echo", new BuilderEcho());
  handelrBuilders.set("square", new BuilderSquare());
  handelrBuilders.set("delay", new BuilderDelay());
  handelrBuilders.set("failed", new BuilderFailed());
}
