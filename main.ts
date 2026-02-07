import { select } from '@inquirer/prompts';
import { run as runProtestant } from './src/protestant/main';
import { run as runCatholic } from './src/catholic/main';

console.log('📖 Bible Data Scraper - Interactive CLI\n');

try {
  const answer = await select({
    message: 'Select Bible Category:',
    choices: [
      {
        name: 'Protestant Bibles',
        value: 'protestant',
        description: 'Download Protestant versions from bibliaonline.com.br',
      },
      {
        name: 'Catholic Bibles',
        value: 'catholic',
        description: 'Download Catholic versions from bibliacatolica.com.br',
      },
    ],
  });

  if (answer === 'protestant') {
    await runProtestant();
  } else {
    await runCatholic();
  }
} catch (error) {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    // User cancelled (Ctrl+C)
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
}
