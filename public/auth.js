(function authHelpersFactory(global) {
  const messages = {
    "password-login-error": "No se pudo iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.",
    "password-signup-sent": "Si el registro es válido, revisa tu correo para confirmar la cuenta.",
    "password-reset-sent": "Si existe una cuenta con ese email, recibirás instrucciones para restablecer la contraseña.",
    "password-updated": "Contraseña actualizada. Ya puedes continuar.",
  };

  function canonicalAuthRedirect(location = global.location) {
    return `${location.origin}${location.pathname}`;
  }

  function validatePassword(password) {
    return String(password || "").length >= 8
      ? { valid: true }
      : { valid: false, code: "PASSWORD_TOO_SHORT" };
  }

  function authMessage(code) {
    return messages[code] || "No se pudo completar la operación. Inténtalo de nuevo.";
  }

  const api = { canonicalAuthRedirect, validatePassword, authMessage };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.PorraAuth = api;
})(typeof window === "undefined" ? globalThis : window);
