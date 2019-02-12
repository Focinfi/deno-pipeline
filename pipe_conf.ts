import { PipeConf } from "./pipe.ts";

/**
 * Build a PipeConf with the given conf
 * Throw Error when:
 *  1. conf['timeout'] or conf['required'] undefined
 *  2. conf['required'] = true but conf['defaultValue'] is undefined
 */
export function newPipeConfWithObject(conf: object): PipeConf {
  let pipeConf = {} as PipeConf;

  // console.log(conf.get('timeout'));
  if (!("timeout" in conf)) {
    throw new Error("timeout is not number");
  }
  pipeConf.timeout = conf["timeout"] as number;

  if (!("required" in conf)) {
    throw new Error("required not set");
  }
  pipeConf.required = conf["required"];

  if (!pipeConf.required && !("defaultValue" in conf)) {
    throw new Error("defautValue not set");
  }

  pipeConf.defaultValue = conf["defaultValue"];

  return pipeConf;
}
