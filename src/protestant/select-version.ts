import { select } from '@inquirer/prompts';
import type { BibleSelection, VersionEntry, VersionGroup, BibleCategory } from '../types'
import rawVersions from './version.json'

const protestantVersions = rawVersions as unknown as VersionGroup[];

export async function selectBibleVersion(): Promise<BibleSelection> {
  const selectedLanguage = await select({
    message: 'Select a language:',
    choices: protestantVersions.map(v => ({
      name: v.name,
      value: v.name
    }))
  });

  const languageGroup = protestantVersions.find(v => v.name === selectedLanguage);
  if (!languageGroup) throw new Error('Language not found');

  const langCode = Object.keys(languageGroup).find(k => k !== 'name' && k !== 'category');
  if (!langCode) throw new Error('Language code not found in configuration');

  const versions = languageGroup[langCode] as VersionEntry[];

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
    category: languageGroup.category as BibleCategory,
    books: []
  };
}
