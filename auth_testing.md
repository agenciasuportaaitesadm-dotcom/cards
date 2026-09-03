# Auth Testing — Digital Cards IA

Single-admin JWT (email/password) protecting only /admin. Public routes / and /c/:slug stay open.

## Credentials
- Admin email: agenciasuportaaitesadm@gmail.com
- Admin password: DigitalCards@2026

## API checks (use external base URL from frontend/.env REACT_APP_BACKEND_URL)
1. Login:
   curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"agenciasuportaaitesadm@gmail.com","password":"DigitalCards@2026"}'
   → returns { access_token, user }
2. Me:
   curl -s "$API/api/auth/me" -H "Authorization: Bearer <token>"  → user object
3. Wrong password → 401 with detail "E-mail ou senha inválidos."
4. Protected list without token → 401:
   curl -s -o /dev/null -w "%{http_code}" "$API/api/clientes"  → 401
5. Protected list with token → 200.
6. Public endpoint stays open:
   curl -s -o /dev/null -w "%{http_code}" "$API/api/public/clientes/studio-exemplo"  → 200

## Frontend flows
- Open /admin without session → login screen (data-testid="admin-login-form").
- Login with admin creds (login-email-input, login-password-input, login-submit-button) → dashboard (Visão geral).
- Reload page → session persists (token in localStorage key dc_admin_token; /auth/me revalidates).
- Wrong creds → error message (data-testid="login-error").
- Encerrar sessão (data-testid="admin-logout-button") → back to login; /admin requires login again.
- Public pages / and /c/studio-exemplo remain accessible with no login.
