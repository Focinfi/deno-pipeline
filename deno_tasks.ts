import { task } from "https://deno.land/x/task_runner/mod.ts";

task("test_pipe_conf", "deno pipe_conf_test.ts");
task("test_pipe", "deno pipe_test.ts");
task("test_parallel", "deno parallel_test.ts");
task("test_line", "deno line_test.ts");
task("test", "$test_pipe_conf", "$test_pipe", "$test_parallel", "$test_line");
