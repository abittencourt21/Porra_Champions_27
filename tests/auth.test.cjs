const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canonicalAuthRedirect,
  validatePassword,
  authMessage,
} = require("../public/auth.js");

test("preserva el subpath de GitHub Pages en los redirects", () => {
  assert.equal(
    canonicalAuthRedirect({ origin: "https://abittencourt21.github.io", pathname: "/Porra_Champions_27/" }),
    "https://abittencourt21.github.io/Porra_Champions_27/",
  );
});

test("no admite contraseñas de menos de ocho caracteres", () => {
  assert.deepEqual(validatePassword("porra27"), { valid: false, code: "PASSWORD_TOO_SHORT" });
  assert.deepEqual(validatePassword("porra2027"), { valid: true });
});

test("los mensajes de acceso y recuperación no enumeran cuentas", () => {
  assert.equal(authMessage("password-login-error"), "No se pudo iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.");
  assert.equal(authMessage("password-reset-sent"), "Si existe una cuenta con ese email, recibirás instrucciones para restablecer la contraseña.");
});
