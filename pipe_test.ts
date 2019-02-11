import {
  runTests,
  test,
  assert
} from "https://deno.land/x/testing/mod.ts";
import {
  Res,
  Pipe,
  PipeType,
  Status
} from "./interfaces.ts"
import {
  buildPipe,
  handleWithTimeout
} from "./pipe.ts";
import { handelrBuilders } from "./builders.ts";
import { mockHandelrBuilders } from "./builders_test.ts";
import { Parallel } from "./parallel.ts";

mockHandelrBuilders();

test(function testBuildPipeUnknownRefId() {
  assert.throws(() => {
    buildPipe({
      refId: "unknown",
      timeout: 1000,
      required: false
    })
  });
});

test(function testBuildPipeUnknownBuilderName() {
  assert.throws(() => {
    buildPipe({
      timeout: 1000,
      required: true,
      builderName: "unkown"
    })
  });
});

test(async function testBuildPipeWithBuilderName() {
  const p = buildPipe({
    timeout: 1000,
    required: true,
    builderName: "echo"
  })

  assert.equal(p.type, PipeType.Single);
  assert.equal(p.conf, {
    timeout: 1000,
    required: true,
    defaultValue: undefined
  });
  const r = await p.handler.handle({ status: Status.Ok, data: 1 })
  assert.equal(r.data, 1);
});

test(function testBuildPipeWithoutHandlers() {
  assert.throws(() => {
    const p = buildPipe({
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

test(function testHandleWithTimeout() {
  const p = buildPipe({
    timeout: 500,
    required: true,
    builderName: "delay",
    builderConf: {
      delay: 1000
    }
  });

  assert.throwsAsync(async () => {
    await handleWithTimeout(p, { status: Status.New });
  });
});

test(function testHandleWithFailed() {
  const p = {
    type: PipeType.Single,
    conf: {
      timeout: 1000,
      required: true
    },
    handler: {
      async handle(res: Res): Promise<Res> {
        throw "failed";
      }
    }

  } as Pipe;

  assert.throwsAsync(async () => {
    await handleWithTimeout(p, { status: Status.New });
  });
});

test(async function testHandleWithDefaultValue() {
  const p = {
    type: PipeType.Single,
    conf: {
      timeout: 1000,
      required: false,
      defaultValue: -1,
    },
    handler: {
      async handle(res: Res): Promise<Res> {
        throw "failed";
      }
    }

  } as Pipe;
  const d = await handleWithTimeout(p, { status: Status.New });
  assert.equal(d.data, -1);
});

test(function testBuildParralPipe() {
  const conf = [
    {
      builderName: "square",
      timeout: 1000,
      required: true,
    },
    {
      builderName: "delay",
      builderConf: {
        delay: 500,
      },
      timeout: 1000,
      required: true,
    },
    {
      builderName: "delay",
      builderConf: {
        delay: 500,
      },
      timeout: 1000,
      required: true,
    }
  ];

  const pipe = buildPipe(conf);

  assert.assert(pipe.handler instanceof Parallel);
});

runTests();