import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const requiredPhases = Object.freeze([
  'angular-quality',
  'angular-tests',
  'contracts',
  'openspec-metadata',
  'production-build',
  'secrets',
  'dependency-review',
]);

export function verifyCiPhases(needs) {
  if (needs === null || typeof needs !== 'object' || Array.isArray(needs)) {
    throw new Error('CI dependency results are missing or malformed');
  }
  const actual = Object.keys(needs).sort();
  const expected = [...requiredPhases].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error('CI dependency list does not match the required phases');
  }
  const incomplete = requiredPhases.filter((phase) => needs[phase]?.result !== 'success');
  if (incomplete.length > 0) {
    throw new Error(`CI phases did not succeed: ${incomplete.join(', ')}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    verifyCiPhases(JSON.parse(process.env.NEEDS_JSON ?? ''));
    process.stdout.write('All required CI phases succeeded.\n');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
