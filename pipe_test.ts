import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { Handler, HandlerBuilder } from "./handler.ts";
import { Pipe, PipeConf, PipeType } from "./pipe.ts";
import { HandlerBuilderEcho, TestBuilders } from "./mock_test.ts";

Deno.test({
  name: "build with unknown ref id",
  fn(): void {
    assertThrows(() => {
      new Pipe({
        refName: "unknown",
        timeout: 1000,
        required: true,
      });
    });
  },
});

Deno.test({
  name: "build with unknown builder name",
  fn(): void {
    assertThrows(() => {
      new Pipe({
        timeout: 1000,
        required: true,
        builderName: "unknown",
      });
    });
  },
});

Deno.test({
  name: "build with builder name",
  fn(): void {
    const p = new Pipe({
      timeout: 1000,
      required: true,
      builderName: "echo",
    }, TestBuilders);
    assertEquals(p.type, PipeType.Single);
    assertEquals(p.conf, {
      timeout: 1000,
      required: true,
      builderName: "echo",
    });
  },
});

Deno.test({
  name: "build withd ref id",
  fn(): void {
    const p = new Pipe(
      {
        timeout: 1000,
        required: true,
        refName: "echo-demo",
      },
      TestBuilders,
      {
        getHandler(name: string): Handler {
          return HandlerBuilderEcho.buildHandler();
        },
      },
    );
    assertEquals(p.type, PipeType.Single);
    assertEquals(p.conf, {
      timeout: 1000,
      required: true,
      refName: "echo-demo",
    });
  },
});

Deno.test({
  name: "build parallel pipe",
  fn(): void {
    const delayMap = new Map<string, any>([
      ["delay", 500],
    ]);

    const conf = [
      {
        builderName: "square",
        timeout: 1000,
        required: true,
      },
      {
        builderName: "delay",
        builderConf: delayMap,
        timeout: 1000,
        required: true,
      },
      {
        builderName: "delay",
        builderConf: delayMap,
        timeout: 1000,
        required: true,
      },
    ];

    const p = new Pipe(conf, TestBuilders);
    assertEquals(p.type, PipeType.Parallel);
  },
});
