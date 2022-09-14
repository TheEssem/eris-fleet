import { IPC } from "./IPC";
import crypto from "crypto";
import { parseJSON, reconstructError, stringifyJSON } from "./Serialization";
import Oceanic from "oceanic.js";

interface CentralRequestHandlerOptions {
	timeout: number;
}

interface CentralRequestHandlerMessage {
	op: string;
	id: string;
	value: {resolved: boolean, value: unknown, valueSerialized: string};
}

export class CentralRequestHandler {
	private timeout: number;
	private ipc: IPC;
	private requests: Map<string, (r: {resolved: boolean, value: unknown}) => void>

	constructor(ipc: IPC, options: CentralRequestHandlerOptions) {
		this.timeout = options.timeout;
		this.ipc = ipc;
		this.requests = new Map();

		process.on("message", (message: CentralRequestHandlerMessage) => {
			if (message.op === "centralApiResponse") {
				const request = this.requests.get(message.id);
				if (request) {
					message.value.value = parseJSON(message.value.valueSerialized);
					request(message.value);
				}
			}
		});
	}

	public request(options: Oceanic.RequestOptions): Promise<unknown> {
		const UUID = crypto.randomBytes(16).toString("hex");

		const fileStrings = [];
		if (options.files) {
			for (let i = 0; i < options.files.length; i++) {
				if (options.files[i].contents) {
					fileStrings.push(Buffer.from(options.files[i].contents).toString("base64"));
					options.files[i].contents = Buffer.from([]);
				}
			}
		}
		//const data = {method, url, auth, body, file, fileString, _route, short};
		const dataSerialized = stringifyJSON(options);

		if (process.send) process.send({op: "centralApiRequest", request: {UUID, dataSerialized, fileStrings}});

		return new Promise((resolve, reject) => {
			// timeout
			const timeout = setTimeout(() => {
				this.requests.delete(UUID);
				reject(`Request timed out (>${this.timeout}ms)`);
			}, this.timeout);

			const callback = (r: {resolved: boolean, value: unknown}) => {
				this.requests.delete(UUID);
				clearTimeout(timeout);
				if (r.resolved) {
					resolve(r.value);
				} else {
					const value = r.value as {convertedErrorObject: boolean, error: unknown};
					if (value.convertedErrorObject) {
						reject(reconstructError(value.error as NodeJS.ErrnoException));
					} else {
						reject(value.error);
					}
				}
			};

			this.requests.set(UUID, callback);
		});
	}
}