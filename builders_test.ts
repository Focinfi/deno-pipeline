import {
  Handler,
  Res,
  HandlerBuilder,
  Status
} from "./interfaces.ts";
import { delay } from "./util.ts";
import { handelrBuilders } from "./builders.ts";

class BuilderEcho implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        return new Promise(resolve => resolve(res));
      }
    }
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
    }
  }
}

class BuilderDelay implements HandlerBuilder {
  build(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        if (conf) {
          await delay(conf['delay']);
        }
        return res;
      }
    }
  }
}

export function mockHandelrBuilders() {
  handelrBuilders.set("echo", new BuilderEcho());
  handelrBuilders.set("square", new BuilderSquare());
  handelrBuilders.set("delay", new BuilderDelay());
}
