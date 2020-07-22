import {
  Handler,
  Res,
  HandlerBuilder,
  Status,
} from "./handler.ts";
import { delay } from "https://deno.land/std/async/delay.ts";

class Echo implements HandlerBuilder {
  buildHandler(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        return new Promise((resolve) => resolve(res));
      },
    };
  }
}

class Square implements HandlerBuilder {
  buildHandler(conf?: Map<string, any>): Handler {
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

class Delay implements HandlerBuilder {
  buildHandler(conf?: Map<string, any>): Handler {
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

class Failed implements HandlerBuilder {
  buildHandler(conf?: Map<string, any>): Handler {
    return {
      async handle(res: Res): Promise<Res> {
        throw new Error("failed");
      },
    };
  }
}

export const HandlerBuilderEcho = new Echo();
export const HandlerBuilderSquare = new Square();
export const HandlerBuilderDelay = new Delay();
export const HandlerBuilderFailed = new Failed();

export const TestBuilders = {
  getBuilder(name: string): HandlerBuilder {
    const builder = new Map<string, HandlerBuilder>([
      ["echo", HandlerBuilderEcho],
      ["square", HandlerBuilderSquare],
      ["delay", HandlerBuilderDelay],
      ["failed", HandlerBuilderFailed],
    ]).get(name);
    if (!builder) {
      throw Error("builder not found");
    }
    return builder;
  },
};
