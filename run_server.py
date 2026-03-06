#!/usr/bin/env python3
"""
EGX Investment API Server Runner
"""
import sys
import asyncio

# Fix for Windows: Use SelectorEventLoop instead of ProactorEventLoop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8010,
        reload=settings.DEBUG,
        workers=1,
        log_level="info",
        access_log=True,
    )