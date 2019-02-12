import { runTests, test, assert } from "https://deno.land/x/testing/mod.ts";

import { buildParallel } from "./parallel.ts";
import { mockHandelrBuilders } from "./mock_test.ts";
import { Status } from "./handler.ts";

function buildMockDelayParallel(delay: number) {
  mockHandelrBuilders();
  const conf = [
    {
      builderName: "square",
      timeout: 1000,
      required: true
    },
    {
      builderName: "delay",
      builderConf: {
        delay: delay
      },
      timeout: 1000,
      required: true
    },
    {
      builderName: "delay",
      builderConf: {
        delay: delay
      },
      timeout: 1000,
      required: true
    }
  ];

  return buildParallel(conf);
}

test(async function testParallel() {
  const p = buildMockDelayParallel(500);
  assert.equal(p.pipes.length, 3);

  const start = Date.now();
  const res = await p.handle({ status: Status.Ok, data: 2 });
  const procMillisecond = Date.now() - start;

  assert.equal(res.data, [4, 2, 2]);
  assert.assert(procMillisecond >= 500 && procMillisecond < 520);
});

test(function testParallelFailed() {
  const p = buildMockDelayParallel(1500);
  assert.throwsAsync(async () => {
    await p.handle({ status: Status.Ok, data: 2 });
  });
});

runTests();
