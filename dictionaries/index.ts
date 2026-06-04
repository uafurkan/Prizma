import { en } from './en';
import { tr } from './tr';

export type Dictionary = typeof en;

const dictionaries: Record<string, Dictionary> = {
  en,
  tr,
};

export const getDictionary = (locale: string) => dictionaries[locale] || dictionaries['en'];
