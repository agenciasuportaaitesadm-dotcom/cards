# Auth Testing — Digital Cards IA

Single-admin JWT (email/password) protecting only /admin. Public routes / and /c/:slug stay open.

## Credentials
- Admin email: agenciasuportaaitesadm@gmail.com
- Admin password: DigitalCards@2026

## API checks (use external base URL from frontend/.env REACT_APP_BACKEND_URL)
1. Login → returns { access_token, user }.
2. GET /api/auth/me with Bearer → user object.
3. Wrong password → 401 "E-mail ou senha inválidos.".
4. /api/clientes without token → 401; with token → 200.
5. /api/public/clientes/studio-exemplo without token → 200.

## Change password — POST /api/auth/change-password (Bearer required)
Body: { current_password, new_password, confirm_password }
- Wrong current_password → 400 "Senha atual incorreta."
- new != confirm → 400 "As novas senhas não coincidem."
- new_password < 8 chars → 400 "A nova senha deve ter pelo menos 8 caracteres."
- Valid → 200 "Senha alterada com sucesso. Faça login novamente."
- After valid change: login with OLD password → 401; login with NEW password → 200.
IMPORTANT for repeatable tests: after verifying, CHANGE THE PASSWORD BACK to DigitalCards@2026 so later runs/other tests keep working. (Password now persists across restarts — seed no longer overwrites it.)

## Frontend flows
- /admin unauth → login screen (data-testid="admin-login-form").
- Login (login-email-input, login-password-input, login-submit-button) → dashboard.
- Reload keeps session (token localStorage key dc_admin_token; /auth/me revalidates).
- Configurações tab (admin-nav-settings) shows "Segurança da conta" with change-password-form:
  field-current-password, field-new-password, field-confirm-password, change-password-button.
  On success: PT-BR toast then auto logout (~1.5s) → back to login. Login with new password works.
- Encerrar sessão (admin-logout-button) → back to login.
- Public / and /c/studio-exemplo accessible without login.
