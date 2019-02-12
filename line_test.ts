import { runTests, test, assert } from "https://deno.land/x/testing/mod.ts";

import { Status } from "./handler.ts";
import { mockHandelrBuilders } from "./mock_test.ts";
import { buildLine } from "./line.ts";

function buildMockLine(delay: number) {
  mockHandelrBuilders();
  const conf = [
    {
      timeout: 500,
      required: false,
      defaultValue: 4,
      builderName: "square"
    },
    [
      {
        timeout: 1000,
        required: true,
        builderName: "delay",
        builderConf: {
          delay: delay
        }
      },
      {
        timeout: 1000,
        required: true,
        builderName: "delay",
        builderConf: {
          delay: delay
        }
      }
    ]
  ];

  return buildLine(conf);
}

test(async function testLine() {
  const l = buildMockLine(500);

  assert.equal(l.pipes.length, 2);

  const start = Date.now();
  const res = await l.handle({ status: Status.Ok, data: 2 });
  const procMillisecond = Date.now() - start;

  assert.equal(res.data, [4, 4]);
  assert.assert(procMillisecond >= 500 && procMillisecond < 520);

  const reses = await l.handleVerbosely({ status: Status.Ok, data: 2 });
  assert.equal(reses.length, 2);
  console.log(JSON.stringify(reses));
  assert.equal(reses[0].data, 4);
  assert.equal(reses[1].data, [4, 4]);
});

test(function testLineFailed() {
  const l = buildMockLine(1500);
  assert.throwsAsync(async () => {
    await l.handle({ status: Status.Ok, data: 2 });
  });
});
runTests();
