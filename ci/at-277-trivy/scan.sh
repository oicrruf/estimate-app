#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
scanner='docker.io/aquasec/trivy:0.76.2@sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb'
scratch="$(mktemp -d)"
summary_path="${AT277_SUMMARY_PATH:-$scratch/summary.json}"
printf '{"schema":1,"result":"tool_error"}\n' > "$summary_path"
image="at277-app:$$"
container=''
cleanup() {
  if test -n "$container"; then docker rm -f "$container" >/dev/null 2>&1 || true; fi
  docker image rm "$image" >/dev/null 2>&1 || true
  rm -rf "$scratch"
}
trap cleanup EXIT

python3 -m unittest discover -s "$root/ci/at-277-trivy" -q
test -s "$root/dist/estimate-app/browser/index.html"
if test -n "$(find "$root/dist/estimate-app/browser" -type l -print -quit)"; then
  echo 'AT-277: browser bundle contains a symlink' >&2
  exit 2
fi
mkdir "$scratch/context"
cp -R "$root/dist/estimate-app/browser" "$scratch/context/browser"
cp "$root/ci/at-277-trivy/nginx.conf" "$scratch/context/nginx.conf"
docker build -t "$image" -f "$root/ci/at-277-trivy/Dockerfile.scan" "$scratch/context" \
  > "$scratch/build.log" 2>&1 || {
  echo 'AT-277: image build failed' >&2
  exit 2
}
docker run --rm --network none "$image" -t > "$scratch/nginx-test.log" 2>&1 || {
  echo 'AT-277: image configuration failed' >&2
  exit 2
}
docker save -o "$scratch/image.tar" "$image"
container="$(docker create "$scanner" --version)"
docker cp "$container":/usr/local/bin/trivy "$scratch/trivy"
docker rm "$container" >/dev/null
container=''
chmod +x "$scratch/trivy"
test "$("$scratch/trivy" --version)" = 'Version: 0.76.2'
: > "$scratch/empty-ignore"
printf '{}\n' > "$scratch/empty-config.yaml"
bash "$root/ci/at-277-trivy/check_config.sh" "$scratch/trivy" "$scratch"

scan() {
  local target="$1"
  shift
  if ! "$scratch/trivy" "$@" --quiet --cache-dir "$scratch/cache" \
    --config "$scratch/empty-config.yaml" --ignorefile "$scratch/empty-ignore" \
    --secret-config='' --scanners vuln,misconfig,secret \
    --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL --format json --exit-code 0 \
    > "$scratch/$target.json" 2> "$scratch/$target.err"; then
    echo "AT-277: $target scanner or DB failed" >&2
    return 2
  fi
}

scan filesystem fs --skip-dirs "$root/.git" --skip-dirs "$root/node_modules" \
  --skip-dirs "$root/dist" "$root"
scan image image --input "$scratch/image.tar"
python3 "$root/ci/at-277-trivy/summary.py" \
  "$scratch/filesystem.json" "$scratch/image.json" "$summary_path"
