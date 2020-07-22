import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std/testing/asserts.ts";
import { buildParallel } from "./parallel.ts";
import { mockHandlerBuilders } from "./mock_test.ts";
import { Status } from "./handler.ts";

function buildMockDelayParallel(delay: number) {
  mockHandlerBuilders();
  const delayMap = new Map<string, any>([
    ["delay", delay],
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
  return buildParallel(conf);
}

Deno.test({
  name: "build a parallel",
  async fn(): Promise<void> {
    const p = buildMockDelayParallel(500);
    assertEquals(p.pipes.length, 3);
    const start = Date.now();
    const res = await p.handle({ status: Status.Ok, data: 2 });
    const procMillisecond = Date.now() - start;
    assertEquals(res.data, [4, 2, 2]);
    assertEquals(procMillisecond >= 500 && procMillisecond < 520, true);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "build a parallel with failed pipe",
  async fn(): Promise<void> {
    const p = buildMockDelayParallel(1500);

    await assertThrowsAsync(async () => {
      try {
        await p.handle({ status: Status.Ok, data: 2 });
      } catch (e) {
        console.log(e.message);
        throw e;
      }
    });
  },
});
