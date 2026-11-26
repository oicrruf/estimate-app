const subject = process.argv[2];
const author = process.argv[3];
const body = process.argv[4] ?? '';
const branch = process.argv[5] ?? '';
const titleRule = /^(feat|fix|refactor|perf|test|docs|build|ci|chore|revert)\([a-z][a-z0-9-]*\)!?: [a-z][^\n]* \(AT-\d+\)$/;
if (!titleRule.test(subject ?? '')) throw new Error('PR title must be Conventional Commits with AT-XXX');
if (author !== 'Víctor M. Reyes <vm.reyesal@gmail.com>') throw new Error('Unexpected commit identity');
if (/^(Co-authored-by:\s*.*\b(Codex|Claude|ChatGPT)\b|Generated-by:)/im.test(body)) throw new Error('Discretionary AI attribution trailer');
if (branch && !new RegExp('^(feature|hotfix|release)/' + subject.match(/AT-\d+/)?.[0] + '[-/]').test(branch)) throw new Error('PR branch and issue code disagree');
