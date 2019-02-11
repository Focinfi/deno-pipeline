import {
  runTests,
  test,
  assert
} from "https://deno.land/x/testing/mod.ts";

import { PipeType, Status } from "./interfaces.ts"
import { buildPipe } from "./pipe.ts";
import { handelrBuilders } from "./builders.ts";
import { mockHandelrBuilders } from "./builders_test.ts";

mockHandelrBuilders();

test(function testBuildPipeUnknownRefId() {
  assert.throws(() => {
    buildPipe({
      refId: "unknown",
      timeout: 1000,
      required: false
    }, null)
  });
});

test(function testBuildPipeUnknownBuilderName() {
  assert.throws(() => {
    buildPipe({
      timeout: 1000,
      required: true,
      builderName: "unkown"
    }, null)
  });
});

test(async function testBuildPipeWithBuilderName() {
  const p = buildPipe({
    timeout: 1000,
    required: true,
    builderName: "echo"
  }, null)

  assert.equal(p.type, PipeType.Single);
  assert.equal(p.conf, {
    timeout: 1000,
    required: true,
    defaultValue: undefined
  });
  const r = await p.handler.handle({ status: Status.Ok, data: 1 })
  assert.equal(r.data, 1);
});

test(async function testBuildPipeWithRefId() {
  const handlers = new Map([
    ["echo-demo", handelrBuilders.get("echo").build()]
  ]);

  const p = buildPipe({
    timeout: 1000,
    required: true,
    refId: "echo-demo"
  }, handlers);

  assert.equal(p.type, PipeType.Single);
  assert.equal(p.conf, {
    timeout: 1000,
    required: true,
    defaultValue: undefined
  });

  const r = await p.handler.handle({ status: Status.Ok, data: 1 })
  assert.equal(r.data, 1);
});

runTests();