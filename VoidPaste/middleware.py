import time
from fastapi import status, Request
from fastapi.responses import JSONResponse


Banned_Paths = ["/wp-admin", "/phpmyadmin", "/config.php", "/.env"]

visited_history = {}
Rate_limit_window = 60 #(am keeping it one minute, until everything resets)
max_requests = 5 #(this is the max request a user will be allowed to make in a minute)

async def bot_blocker_middleware(request: Request, call_next):
    requested_path = request.url.path
    user_agent = request.headers.get("user-agent", "")
    if requested_path in Banned_Paths:
        print(f" [BLOCKED] Bot attempted to access honeypot path: {requested_path}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Access Denied: Suspected malicious scanning activity."}
        )
    
    if "python-scripts" in user_agent or "curl" in user_agent:
        print(f" [BLOCKED] Script blocked based on User-Agent: {user_agent}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Access Denied: Automated scraping tools are prohibited."}
        )
    
    response = await call_next(request)
    return response


async def rate_limiter_middleware(request: Request, call_next):
    user_ip = request.client.host
    current_time = time.time()
    if user_ip not in visited_history:
        visited_history[user_ip] = []

    visited_history[user_ip] = [t for t in visited_history[user_ip] if current_time - t < Rate_limit_window]

    if len(visited_history[user_ip]) > max_requests :
        return JSONResponse (
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Please slow down."}
        )
    
    visited_history[user_ip].append(time.time())
    return await call_next(request)