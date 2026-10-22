#!/usr/bin/env python3
"""Local server of the workshop: like `python3 -m http.server`, but it tells the
browser never to cache, so everyone always gets the latest version of the files."""

import functools
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
handler = functools.partial(NoCacheHandler, directory=".")
print(f"Serving on http://localhost:{port}/index.html")
http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
