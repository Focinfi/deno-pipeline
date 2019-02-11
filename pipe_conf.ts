import { PipeConf } from "./interfaces.ts";

export function newPipeConfWithObject(conf: object): PipeConf {
  let pipeConf = {} as PipeConf;

  // console.log(conf.get('timeout'));
  if (!('timeout' in conf)) {
    throw Error("timeout is not number");
  }
  pipeConf.timeout = conf['timeout'] as number;

  if (!('required' in conf)) {
    throw Error("required not set");
  }
  pipeConf.required = conf['required'];

  if (!pipeConf.required && !('defaultValue' in conf)) {
    throw Error("defautValue not set");
  }

  pipeConf.defaultValue = conf['defaultValue'];

  return pipeConf;
}
