// Provider registry. To add a provider, implement the adapter contract documented in
// openai-responses.mjs, map its errors onto errors.mjs kinds, and register it here. Fixture schema,
// judge protocol, result schema, baselines and reports do not change.

import * as openaiResponses from './openai-responses.mjs';

const PROVIDERS = new Map([[openaiResponses.id, openaiResponses]]);

export const PROVIDER_IDS = Object.freeze([...PROVIDERS.keys()]);
export const DEFAULT_PROVIDER = openaiResponses.id;

export function getProvider(id) {
  const provider = PROVIDERS.get(id);
  if (!provider) throw new Error('Unknown provider "' + id + '". Available: ' + PROVIDER_IDS.join(', '));
  return provider;
}
