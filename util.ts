import { PipeConf } from "./interfaces.ts";

export function newPipeConfWithObject(conf: Map<string, any>): PipeConf {
  let pipeConf = {} as PipeConf;

  if (conf['timeout'] == undefined) {
    throw Error("timeout is not number");
  }
  pipeConf.timeout = conf['timeout'] as number;

  if (conf['required'] == undefined) {
    throw Error("required not set");
  }
  pipeConf.required = Boolean(conf['required']);

  if (!pipeConf.required && conf['defaultValue'] == undefined) {
    throw Error("defautValue not set");
  }

  pipeConf.defaultValue = conf['defaultValue'];

  return pipeConf;
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}