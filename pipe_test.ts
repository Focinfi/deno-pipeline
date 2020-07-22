import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { handlerBuilders } from "./handler.ts";
import { Pipe, PipeConf, PipeType } from "./pipe.ts";
import { mockHandlerBuilders } from "./mock_test.ts";

mockHandlerBuilders();

Deno.test({
  name: "build with unknown ref id",
  fn(): void {
    assertThrows(() => {
      new Pipe({
        refId: "nukonw",
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
    });
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
    const echoBuilder = handlerBuilders.get("echo");
    if (!echoBuilder) {
      throw Error("echo builder not found");
    }
    const p = new Pipe(
      {
        timeout: 1000,
        required: true,
        refId: "echo-demo",
      },
      new Map([
        ["echo-demo", echoBuilder.build()],
      ]),
    );
    assertEquals(p.type, PipeType.Single);
    assertEquals(p.conf, {
      timeout: 1000,
      required: true,
      refId: "echo-demo",
    });
  },
});

Deno.test({
  name: "build parrall pipe",
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

    const p = new Pipe(conf);
    assertEquals(p.type, PipeType.Parallel);
  },
});
