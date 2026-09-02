"""
Cloudflare-bypass fetcher for the Catholic bible provider (bibliacatolica.com.br).

Strategy (hybrid):
  1. Solve the Cloudflare "Just a moment..." challenge ONCE using nodriver
     (an undetected Chrome) and grab the cf_clearance cookie + User-Agent.
  2. Cache those to .cf-cache.json next to this script.
  3. Serve every subsequent request fast via curl_cffi, which impersonates the
     Chrome TLS fingerprint and reuses the cached cookies/UA.
  4. If a request comes back 403 (cookie expired), re-solve and retry.

Usage:
  python cf_fetch.py <url>

Outputs the raw HTML body to stdout. Errors go to stderr with a non-zero exit.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
CACHE_FILE = SCRIPT_DIR / ".cf-cache.json"

# The origin we solve the challenge against. Cookies are scoped to this host.
DEFAULT_ORIGIN = os.environ.get("CF_ORIGIN", "https://www.bibliacatolica.com.br")

# How long to wait for the challenge to auto-resolve (seconds).
SOLVE_TIMEOUT = 90
# Max attempts to re-solve on 403 before giving up.
MAX_SOLVE_ATTEMPTS = 3
# Impersonation profile for curl_cffi. Must match the real Chrome major version
# launched by nodriver as closely as possible (cf_clearance is bound to the
# TLS/HTTP2 fingerprint). curl_cffi exposes discrete versions; pick the closest.
IMPERSONATE = "chrome150"

# A real (non-headless) Chrome UA. nodriver runs --headless=new which still
# advertises "HeadlessChrome" in navigator.userAgent; Cloudflare flags that on
# replay, so we override the UA at launch to look like a normal desktop Chrome.
REAL_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
)


def log(msg: str) -> None:
    print(f"[cf_fetch] {msg}", file=sys.stderr, flush=True)


def load_cache() -> dict | None:
    if not CACHE_FILE.exists():
        return None
    try:
        data = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        if data.get("origin") == DEFAULT_ORIGIN and data.get("cookies") and data.get("user_agent"):
            return data
    except Exception:
        return None
    return None


def save_cache(cookies: list[dict], user_agent: str) -> None:
    payload = {
        "origin": DEFAULT_ORIGIN,
        "user_agent": user_agent,
        "cookies": cookies,
        "solved_at": time.time(),
    }
    CACHE_FILE.write_text(json.dumps(payload), encoding="utf-8")


def cookies_to_dict(cookies: list[dict]) -> dict:
    return {c["name"]: c["value"] for c in cookies if c.get("name") and c.get("value")}


async def solve_challenge(origin: str) -> tuple[list[dict], str]:
    """Launch undetected Chrome, navigate to origin, wait for cf_clearance, return cookies + UA."""
    import nodriver

    log(f"Solving Cloudflare challenge for {origin} ...")

    browser = await nodriver.start(
        headless=True,
        browser_args=[f"--user-agent={REAL_UA}"],
    )
    try:
        page = await browser.get(origin + "/biblia-ave-maria/")
        deadline = time.time() + SOLVE_TIMEOUT
        cf_clearance = None

        while time.time() < deadline:
            await asyncio.sleep(2)
            try:
                all_cookies = await browser.cookies.get_all()
            except Exception:
                all_cookies = []
            for c in all_cookies:
                name = getattr(c, "name", None)
                if name == "cf_clearance":
                    cf_clearance = getattr(c, "value", None)
                    break
            if cf_clearance:
                break
            # Also bail out early if the page already navigated past the challenge.
            try:
                title = await page.evaluate("document.title")
            except Exception:
                title = None
            if title and "just a moment" not in str(title).lower():
                # Page moved past the interstitial; give cookies one more tick.
                await asyncio.sleep(1)
                try:
                    all_cookies = await browser.cookies.get_all()
                except Exception:
                    all_cookies = []
                for c in all_cookies:
                    if getattr(c, "name", None) == "cf_clearance":
                        cf_clearance = getattr(c, "value", None)
                        break
                if cf_clearance:
                    break

        if not cf_clearance:
            raise RuntimeError("cf_clearance cookie never appeared within timeout")

        # Collect all cookies for the domain.
        try:
            raw_cookies = await browser.cookies.get_all()
        except Exception:
            raw_cookies = []
        cookies: list[dict] = []
        for c in raw_cookies:
            cookies.append({
                "name": getattr(c, "name", ""),
                "value": getattr(c, "value", ""),
                "domain": getattr(c, "domain", ""),
                "path": getattr(c, "path", "/"),
            })

        user_agent = await page.evaluate("navigator.userAgent")
        user_agent = str(user_agent).strip() if user_agent else ""
        # Guard: if the override didn't take, fall back to the real UA.
        if "headless" in user_agent.lower() or not user_agent:
            user_agent = REAL_UA

        log(f"Challenge solved. {len(cookies)} cookies cached. UA={user_agent[:60]}...")
        save_cache(cookies, user_agent)
        return cookies, user_agent
    finally:
        try:
            browser.stop()
        except Exception:
            pass


def fetch_with_cookies(url: str, cookies: list[dict], user_agent: str) -> "object":
    from curl_cffi import requests

    headers = {"User-Agent": user_agent} if user_agent else {}
    return requests.get(
        url,
        impersonate=IMPERSONATE,
        headers=headers,
        cookies=cookies_to_dict(cookies),
        timeout=30,
        allow_redirects=True,
    )


def fetch(url: str, cookies: list[dict], user_agent: str) -> tuple[int, str]:
    resp = fetch_with_cookies(url, cookies, user_agent)
    return resp.status_code, resp.text


async def fetch_html(url: str) -> str:
    cache = load_cache()
    cookies, ua = ((cache or {}).get("cookies"), (cache or {}).get("user_agent"))

    # Fast path: cached cookies.
    if cookies and ua:
        status, body = fetch(url, cookies, ua)
        if status == 200 and "just a moment" not in body.lower()[:500]:
            return body
        log(f"Cached cookies rejected (status={status}). Re-solving.")

    # Slow path: solve then fetch, retrying on persistent 403.
    for attempt in range(1, MAX_SOLVE_ATTEMPTS + 1):
        cookies, ua = await solve_challenge(DEFAULT_ORIGIN)
        status, body = fetch(url, cookies, ua)
        if status == 200 and "just a moment" not in body.lower()[:500]:
            return body
        log(f"Attempt {attempt} failed after re-solve (status={status}).")
        # Drop stale cache so next attempt forces a fresh solve.
        try:
            CACHE_FILE.unlink(missing_ok=True)
        except Exception:
            pass

    raise RuntimeError(f"Failed to fetch {url} after {MAX_SOLVE_ATTEMPTS} solve attempts")


def main() -> int:
    # Force UTF-8 output so non-ASCII HTML (Polish, Spanish, etc.) survives on Windows.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    if len(sys.argv) < 2:
        print("Usage: cf_fetch.py <url>", file=sys.stderr)
        return 2
    url = sys.argv[1]
    try:
        html = asyncio.run(fetch_html(url))
        sys.stdout.write(html)
        return 0
    except Exception as exc:
        print(f"[cf_fetch] ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
