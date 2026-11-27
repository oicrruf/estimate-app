import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CANONICAL_REMOTE = 'https://github.com/oicrruf/estimate-api.git';
const APPROVED_SHA = '248ca4b69eb135ebff0b80fa61fb55598ba0bbb6';
const DEVELOP_REF = 'refs/remotes/canonical/develop';
const CONTRACT_PATH = 'contracts/openapi.json';

function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { maxBuffer: 10 * 1024 * 1024 });
}

export function verifyCanonicalHistory(repo, approvedSha, currentRef, appContractPath) {
  const ancestry = spawnSync('git', ['-C', repo, 'merge-base', '--is-ancestor', approvedSha, currentRef]);
  if (ancestry.error || ancestry.status !== 0) {
    throw new Error('Current canonical API ref does not descend the approved commit');
  }
  const approved = git(repo, 'show', `${approvedSha}:${CONTRACT_PATH}`);
  const current = git(repo, 'show', `${currentRef}:${CONTRACT_PATH}`);
  const app = readFileSync(appContractPath);
  if (!current.equals(approved) || !current.equals(app)) {
    throw new Error('Canonical API contract bytes differ from the approved app reference');
  }
  return current;
}

function main() {
  const repo = mkdtempSync(join(tmpdir(), 'estimate-api-lineage-'));
  try {
    git(repo, 'init', '--bare', '--quiet');
    git(repo, 'fetch', '--no-tags', '--quiet', CANONICAL_REMOTE,
      `+refs/heads/develop:${DEVELOP_REF}`);
    const current = verifyCanonicalHistory(repo, APPROVED_SHA, DEVELOP_REF,
      'contracts/openapi.json');
    const exportPath = join(repo, 'canonical-openapi.json');
    writeFileSync(exportPath, current);
    execFileSync(process.execPath,
      ['scripts/generate-contract.mjs', '--check', '--api-export', exportPath],
      { stdio: 'inherit' });
    process.stdout.write('Canonical API lineage and contract bytes verified.\n');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
