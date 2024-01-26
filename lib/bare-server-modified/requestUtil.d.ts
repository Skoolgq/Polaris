/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import WebSocket from 'ws';
import type { Request } from './AbstractMessage.js';
import type { Options } from './BareServer.js';
export type BareHeaders = Record<string, string | string[]>;
export declare function randomHex(byteLength: number): string;
export declare function fetch(request: Request, signal: AbortSignal, requestHeaders: BareHeaders, remote: URL, options: Options): Promise<IncomingMessage>;
export declare function upgradeFetch(request: Request, signal: AbortSignal, requestHeaders: BareHeaders, remote: URL, options: Options): Promise<[res: IncomingMessage, socket: Duplex, head: Buffer]>;
export declare function webSocketFetch(request: Request, requestHeaders: BareHeaders, remote: URL, protocols: string[], options: Options): Promise<[req: IncomingMessage, socket: WebSocket]>;
