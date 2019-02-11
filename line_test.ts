import {
  runTests,
  test,
  assert
} from "https://deno.land/x/testing/mod.ts";

import { Status } from "./interfaces.ts";
import { mockHandelrBuilders } from "./builders_test.ts";
import { buildLine } from "./line.ts"

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
          delay: delay,
        }
      },
      {
        timeout: 1000,
        required: true,
        builderName: "delay",
        builderConf: {
          delay: delay,
        }
      }
    ]
  ]

  return buildLine(conf)
}

test(async function testLine() {
  const l = buildMockLine(500);

  assert.equal(l.pipes.length, 2);

  const start = Date.now();
  const res = await l.handle({ status: Status.Ok, data: 2 });
  const procMillisecond = Date.now() - start;

  assert.equal(res.data, [4, 4])
  assert.assert(procMillisecond >= 500 && procMillisecond < 520);
});

runTests();