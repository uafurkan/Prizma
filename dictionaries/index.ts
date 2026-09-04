import { en } from './en';

export type Dictionary = typeof en;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept so call sites passing a locale don't need updating
export const getDictionary = (_locale?: string): Dictionary => en;
