#!/usr/bin/env python3
"""Freeze the exact reader-facing GitHub Pages payload."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "PUBLIC_MANIFEST.json"
ARCHIVE_TIMESTAMP = (2026, 8, 14, 0, 0, 0)


def digest(path: Path) -> dict[str, int | str]:
    data = path.read_bytes()
    return {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def load_manifest() -> dict:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    files = manifest.get("site_files")
    if not isinstance(files, list) or not files or len(files) != len(set(files)):
        raise ValueError("site_files must be a non-empty unique list")
    if "PUBLIC_MANIFEST.json" not in files:
        raise ValueError("site_files must include PUBLIC_MANIFEST.json")
    for name in files:
        path = PurePosixPath(name)
        if path.is_absolute() or ".." in path.parts or any(part.startswith(".") for part in path.parts):
            raise ValueError(f"unsafe public path: {name}")
        source = ROOT / path
        if not source.is_file():
            raise ValueError(f"missing public file: {name}")
    return manifest


def expected_evidence(manifest: dict) -> dict[str, dict[str, int | str]]:
    return {
        name: digest(ROOT / name)
        for name in manifest["site_files"]
        if name != "PUBLIC_MANIFEST.json"
    }


def write_manifest(manifest: dict, evidence: dict) -> None:
    manifest["files"] = evidence
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def populate_site(site_dir: Path, files: list[str]) -> None:
    if site_dir.exists():
        shutil.rmtree(site_dir)
    for name in files:
        target = site_dir / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / name, target)


def write_archive(artifact: Path, files: list[str]) -> None:
    artifact.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(artifact, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in files:
            info = zipfile.ZipInfo(name, date_time=ARCHIVE_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / name).read_bytes())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail instead of updating drifted file evidence")
    parser.add_argument("--site-dir", type=Path, help="copy the exact payload to a deployment directory")
    parser.add_argument("--artifact", type=Path, help="write a deterministic ZIP without directory entries")
    args = parser.parse_args()

    try:
        manifest = load_manifest()
        evidence = expected_evidence(manifest)
        if args.check:
            if manifest.get("files") != evidence:
                raise ValueError("PUBLIC_MANIFEST.json file evidence is stale; rebuild it before release")
        else:
            write_manifest(manifest, evidence)
            manifest = load_manifest()
        files = manifest["site_files"]
        if args.site_dir:
            populate_site(args.site_dir.resolve(), files)
        if args.artifact:
            write_archive(args.artifact.resolve(), files)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(f"Verified {len(files)} public files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
