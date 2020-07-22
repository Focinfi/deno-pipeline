import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std/testing/asserts.ts";
import { Status } from "./handler.ts";
import { buildLine, buildLineWithJson } from "./line.ts";
import { TestBuilders } from "./mock_test.ts";

Deno.test({
  name: "build a new line",
  async fn(): Promise<void> {
    const l = buildLine([
      {
        timeout: 500,
        required: true,
        builderName: "square",
      },
      {
        timeout: 500,
        required: true,
        builderName: "square",
      },
    ], TestBuilders);
    const { status, data } = await l.handle({ status: Status.Ok, data: 2 });
    assertEquals(status, Status.Ok);
    assertEquals(data, 16);

    const reses = await l.handleVerbosely({ status: Status.Ok, data: 2 });
    assertEquals(
      reses.map((res) => {
        return res.data;
      }),
      [4, 16],
    );
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "build a new line with timeout",
  async fn(): Promise<void> {
    const l = buildLine([
      {
        timeout: 100,
        required: true,
        builderName: "delay",
        builderConf: new Map<string, any>([
          ["delay", 200],
        ]),
      },
    ], TestBuilders);

    await assertThrowsAsync(
      async (): Promise<void> => {
        try {
          await l.handle(
            { status: Status.Ok, data: 1 },
          );
        } catch (e) {
          console.log("message:", e.message);
          throw e;
        }
      },
    );
  },
});

Deno.test({
  name: "build a new build with failed pipe",
  async fn(): Promise<void> {
    const l = buildLine([
      {
        timeout: 100,
        required: true,
        builderName: "failed",
      },
    ], TestBuilders);

    await assertThrowsAsync(
      async (): Promise<void> => {
        try {
          await l.handle(
            { status: Status.Ok, data: 1 },
          );
        } catch (e) {
          console.log("message:", e.message);
          throw e;
        }
      },
    );
  },
});

Deno.test({
  name: "build a line with default value",
  async fn(): Promise<void> {
    const l = buildLine([
      {
        timeout: 100,
        required: false,
        defaultValue: 1,
        builderName: "failed",
      },
    ], TestBuilders);
    const { status, data } = await l.handle({ status: Status.Ok, data: 2 });
    assertEquals(status, Status.InternalFailed);
    assertEquals(data, 1);
  },
});

Deno.test({
  name: "build with json",
  async fn(): Promise<void> {
    const l = buildLineWithJson(
      `[
      {
        "timeout": 500,
        "required": true,
        "builderName": "square"
      },
      {
        "timeout": 500,
        "required": true,
        "builderName": "square"
      }
    ]`,
      TestBuilders,
    );
    const { status, data } = await l.handle({ status: Status.Ok, data: 2 });
    assertEquals(status, Status.Ok);
    assertEquals(data, 16);
  },
});
