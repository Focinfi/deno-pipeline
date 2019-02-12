import { assert, test, runTests } from "https://deno.land/x/testing/mod.ts";

import { newPipeConfWithObject } from "./pipe_conf.ts";

test(function testMissingTimeout() {
  assert.throws(() => {
    newPipeConfWithObject({});
  });
});

test(function testTimeoutNotNumber() {
  assert.throws(() => {
    newPipeConfWithObject({ timeout: "a" });
  });
});

test(function testMissingReqired() {
  assert.throws(() => {
    newPipeConfWithObject({ timeout: 1 });
  });
});

test(function testReqiredTrue() {
  const conf = newPipeConfWithObject({ timeout: 1, required: true });
  assert.equal(conf, {
    timeout: 1,
    required: true,
    defaultValue: undefined
  });
});

test(function testMissingDefaultValue() {
  assert.throws(() => {
    newPipeConfWithObject({ timeout: 1, required: false });
  });
});

test(function testReqiredFalse() {
  const conf = newPipeConfWithObject({
    timeout: 1,
    required: false,
    defaultValue: 2
  });
  assert.equal(conf, {
    timeout: 1,
    required: false,
    defaultValue: 2
  });
});

runTests();
