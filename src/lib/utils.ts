import { pseudoRandomBytes } from 'crypto';
import type { Request } from 'express';
import * as ipaddr from 'ipaddr.js';
import { promisify } from 'util';
import { delay } from 'bluebird';

export const pseudoRandomBytesAsync = promisify(pseudoRandomBytes);

export const isValidInteger = (num: any): num is number => {
	const n = checkInt(num);
	return n !== false && n > 0;
};

export const checkInt = (num?: string): number | false => {
	if (num == null) {
		return false;
	}
	const n = parseInt(num, 10);
	if (Number.isNaN(n)) {
		return false;
	}
	return n;
};

export const getIP = (req: Request): string | undefined =>
	req.ip ||
	(req as any)._remoteAddress ||
	(req.connection != null && req.connection.remoteAddress) ||
	undefined;

// Returns the IPv4 formatted address if possible, or undefined if not
export const getIPv4 = (req: Request): string | undefined => {
	try {
		const rawIp = getIP(req);
		if (rawIp == null) {
			return;
		}
		const ip = ipaddr.parse(rawIp);

		if (ip.kind() === 'ipv4') {
			return ip.toString();
		} else if (ip instanceof ipaddr.IPv6 && ip.isIPv4MappedAddress()) {
			return ip.toIPv4Address().toString();
		}
	} catch {
		// Ignore errors
	}
};

export const b64decode = (str: string): string =>
	Buffer.from(str, 'base64').toString().trim();

export const throttledForEach = async <T, U>(
	array: T[],
	delayMS: number,
	fn: (item: T) => PromiseLike<U>,
): Promise<U[]> => {
	const promises: Array<PromiseLike<U>> = [];
	for (const item of array) {
		// We do not wait for each individual fn, we just throttle the calling of them
		promises.push(fn(item));
		// Delay by the throttle rate before we continue to the next item
		await delay(delayMS);
	}
	// We return the results of the iterator so the caller can await them as necessary
	return await Promise.all(promises);
};
