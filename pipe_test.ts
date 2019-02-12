import { runTests, test, assert } from "https://deno.land/x/testing/mod.ts";
import { Status, handelrBuilders } from "./handler.ts";
import { Pipe, PipeType } from "./pipe.ts";
import { mockHandelrBuilders } from "./mock_test.ts";
import { Parallel } from "./parallel.ts";

mockHandelrBuilders();

test(function testBuildPipeUnknownRefId() {
  assert.throws(() => {
    new Pipe({
      refId: "unknown",
      timeout: 1000,
      required: false
    });
  });
});

test(function testBuildPipeUnknownBuilderName() {
  assert.throws(() => {
    new Pipe({
      timeout: 1000,
      required: true,
      builderName: "unkown"
    });
  });
});

test(async function testBuildPipeWithBuilderName() {
  const p = new Pipe({
    timeout: 1000,
    required: true,
    builderName: "echo"
  });

  assert.equal(p.type, PipeType.Single);
  assert.equal(p.conf, {
    timeout: 1000,
    required: true,
    defaultValue: undefined
  });
  const r = await p.handle({ status: Status.Ok, data: 1 });
  assert.equal(r.data, 1);
});

test(function testBuildPipeWithoutHandlers() {
  assert.throws(() => {
    new Pipe({
      timeout: 1000,
      required: true,
      refId: "echo-demo"
    });
  });
});

test(async function testBuildPipeWithRefId() {
  const handlers = new Map([
    ["echo-demo", handelrBuilders.get("echo").build()]
  ]);

  const p = new Pipe(
    {
      timeout: 1000,
      required: true,
      refId: "echo-demo"
    },
    handlers
  );

  assert.equal(p.type, PipeType.Single);
  assert.equal(p.conf, {
    timeout: 1000,
    required: true,
    defaultValue: undefined
  });

  const r = await p.handle({ status: Status.Ok, data: 1 });
  assert.equal(r.data, 1);
});

test(function testHandleWithTimeout() {
  const p = new Pipe({
    timeout: 500,
    required: true,
    builderName: "delay",
    builderConf: {
      delay: 1000
    }
  });

  assert.throwsAsync(async () => {
    await p.handle({ status: Status.New });
  });
});

test(function testHandleWithFailed() {
  const p = new Pipe({
    timeout: 500,
    required: true,
    builderName: "failed"
  });

  assert.throwsAsync(async () => {
    await p.handle({ status: Status.New });
  });
});

test(async function testHandleWithDefaultValue() {
  const p = new Pipe({
    timeout: 500,
    required: false,
    defaultValue: -1,
    builderName: "failed"
  });

  const d = await p.handle({ status: Status.New });
  assert.equal(d.data, -1);
});

test(function testBuildParralPipe() {
  const conf = [
    {
      builderName: "square",
      timeout: 1000,
      required: true
    },
    {
      builderName: "delay",
      builderConf: {
        delay: 500
      },
      timeout: 1000,
      required: true
    },
    {
      builderName: "delay",
      builderConf: {
        delay: 500
      },
      timeout: 1000,
      required: true
    }
  ];

  const pipe = new Pipe(conf);

  assert.assert(pipe.handler instanceof Parallel);
});

runTests();
