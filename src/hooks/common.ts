import { HookRequest } from '@resin/pinejs/out/sbvr-api/sbvr-utils';
import { PinejsClient } from '../platform/index';
import * as deviceTypes from '../lib/device-types';
import * as Promise from 'bluebird';

export const resolveDeviceType = (
	api: PinejsClient,
	request: HookRequest,
	fkValue: string,
) => {
	return Promise.try(() => {
		if (request.values.device_type != null && request.values[fkValue] == null) {
			// translate device_type to is_for__device_type
			return deviceTypes
				.getDeviceTypeIdBySlug(api, request.values.device_type)
				.then(dt => {
					if (!dt) {
						throw new deviceTypes.UnknownDeviceTypeError(
							request.values.device_type,
						);
					}
					request.values[fkValue] = dt.id;
				});
		}
	})
		.then(() => {
			if (!request.values[fkValue]) {
				throw new deviceTypes.InvalidDeviceTypeError();
			}

			return api.get({
				resource: 'device_type',
				id: request.values[fkValue],
				options: {
					$select: ['slug'],
				},
			});
		})
		.then((dt: { slug: string }) => {
			if (!dt) {
				throw new deviceTypes.InvalidDeviceTypeError();
			}
			return deviceTypes.findBySlug(api, dt.slug);
		});
};