/// <reference types="node" />
import { Readable } from "stream";
export declare function _request<T>(method: string, apiKey: string, apiURL: string, requireSSL: boolean, path: string, payload?: string | Buffer | Readable, options?: Object): Promise<T>;
