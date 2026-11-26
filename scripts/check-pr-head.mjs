import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [title, branch, headSha] = process.argv.slice(2);
if (!/^[0-9a-f]{40}$/.test(headSha ?? '')) throw new Error('Expected full PR head SHA');
const git = (format) => execFileSync('git', ['show', '-s', `--format=${format}`, headSha], { encoding: 'utf8' }).trimEnd();
const author = git('%an <%ae>');
const body = git('%B');
const policy = fileURLToPath(new URL('./check-policy.mjs', import.meta.url));
const result = spawnSync(process.execPath, [policy, title, author, body, branch], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
