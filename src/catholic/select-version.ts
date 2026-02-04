import { select } from '@inquirer/prompts';
import type { Bible } from '../types'
import catholicVersions from './version.json'

export async function selectBibleVersion(): Promise<Partial<Bible>> {
  const selectedLanguage = await select({
    message: 'Select a language:',
    choices: catholicVersions.map(v => ({
      name: v.name,
      value: v.name
    }))
  });

  const languageGroup = catholicVersions.find(v => v.name === selectedLanguage);
  if (!languageGroup) throw new Error('Language not found');

  // Find the language code key (e.g., 'pt-BR', 'en')
  // It's the key that is not 'name' or 'category'
  const langCode = Object.keys(languageGroup).find(k => k !== 'name' && k !== 'category');
  if (!langCode) throw new Error('Language code not found in configuration');

  const versions = (languageGroup as any)[langCode] as Array<{name: string, abbrev: string}>;

  const selectedVersionAbbrev = await select({
    message: 'Select a version:',
    choices: versions.map(v => ({
      name: v.name,
      value: v.abbrev
    }))
  });

  const version = versions.find(v => v.abbrev === selectedVersionAbbrev);
  if (!version) throw new Error('Version not found');

  return {
    id: version.abbrev,
    name: version.name,
    lang: langCode,
    category: (languageGroup as any).category,
    books: []
  };
}
