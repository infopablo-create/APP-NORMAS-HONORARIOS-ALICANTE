# Activar cuentas en GitHub Pages

Web: https://infopablo-create.github.io/APP-NORMAS-HONORARIOS-ALICANTE/

La sección de suscripción ha sido retirada. La calculadora y la agenda local se pueden utilizar sin cuenta. La autenticación usa el SDK oficial de Supabase, empaquetado en el repositorio; no hay que instalar un servidor para GitHub Pages. La cuenta no sincroniza ni protege por sí sola la agenda que se guarda en el perfil local del navegador.

## 1. Datos públicos del proyecto

En Supabase, obtén **Project URL** y **Publishable key**. La URL suele estar en Connect o Settings → Data API; las claves públicas, en Settings → API Keys. Los nombres pueden variar con la interfaz.

Edita `auth-config.js`:

```js
window.HONORARIOS_AUTH = Object.freeze({
  url: "https://TU-PROYECTO.supabase.co",
  publishableKey: "TU-PUBLISHABLE-KEY"
});
```

Es configuración pública que verá el navegador. No incluyas una Secret key, clave service_role, contraseña de base de datos, secreto OAuth ni token de sesión. Se admite también una clave anon heredada; el código rechaza claves con otro rol.

Tras modificar el archivo, ejecuta `npm ci` y `npm run build:auth` si necesitas regenerar/copiar los recursos de autenticación. Incluye en el commit `auth-config.js`, `auth.js`, `THIRD_PARTY_NOTICES.txt` y sus copias en `public/`. Para la página raíz ya publicada, el archivo editable principal es `auth-config.js` de la raíz.

## 2. URL de la aplicación

En Supabase → Authentication → URL Configuration:

- **Site URL:** `https://infopablo-create.github.io/APP-NORMAS-HONORARIOS-ALICANTE/`
- **Redirect URLs:** añade exactamente esa misma dirección, con barra final.

La aplicación utiliza el flujo PKCE y vuelve a la carpeta de la página. Configura otros orígenes solo si los necesitas para una instalación propia. No hace falta añadir URLs locales para usar la página publicada.

## 3. Crear cuenta con correo

En Authentication → Sign In / Providers, habilita Email. Decide si la cuenta requiere confirmar el correo. La interfaz admite ambas opciones y pide revisar el correo cuando Supabase no devuelve una sesión tras el registro. Revisa la configuración de correo, sus cuotas y la entrega antes de abrir el registro a usuarios reales. La app no anuncia recuperación automática de contraseña porque todavía no la implementa.

## 4. Google

1. En Google Cloud crea un cliente OAuth de tipo **Aplicación web**, con su pantalla de consentimiento.
2. Copia la **Callback URL que muestra Supabase en el proveedor Google**, normalmente `https://TU-PROYECTO.supabase.co/auth/v1/callback`, como URI de redirección autorizada del cliente Google.
3. Introduce el Client ID y el Client Secret en el formulario del proveedor Google en Supabase y habilítalo. El secreto se queda en Supabase; no va en GitHub ni en el chat.
4. Si Google mantiene la aplicación en modo de prueba, añade las cuentas de prueba permitidas.

## 5. Microsoft / Outlook

1. En Microsoft Entra registra una aplicación. Para admitir Outlook/Hotmail y cuentas profesionales, selecciona cuentas de cualquier directorio organizativo **y cuentas personales de Microsoft**.
2. Añade una URI de redirección de tipo **Web**: la Callback URL que indica Supabase para Azure/Microsoft.
3. Crea la credencial del cliente y configura Application/Client ID y el **valor** del Client Secret en el proveedor Azure/Microsoft de Supabase. No confundas el valor con el identificador del secreto.
4. Para ambos tipos de cuentas, utiliza la configuración de tenant común de Microsoft (`https://login.microsoftonline.com/common`) cuando el formulario de Supabase la solicite, y habilita el proveedor.
5. El botón de la app usa el proveedor `azure` y solicita el alcance `email`.

Los consentimientos o restricciones de un tenant corporativo dependen de su administrador. No se ha validado el acceso de cuentas reales de Google o Microsoft hasta configurar y probar los proveedores.

## 6. Comprobación

La app lee los proveedores habilitados del proyecto antes de activar los botones. Con configuración vacía, incorrecta o inaccesible mantiene el acceso desactivado y explica el motivo, sin bloquear la calculadora. Cuando esté configurado:

- Crea una cuenta con correo, confirma si corresponde y entra.
- Comprueba entrar y salir con Google.
- Comprueba entrar y salir con Microsoft/Outlook.
- Recarga la página y comprueba la sesión.
- Comprueba la agenda local: los clientes no se suben a Supabase ni se transfieren entre perfiles de navegador.

Las claves públicas configuradas aquí no dan acceso por sí mismas a tablas de datos. Si se añaden tablas privadas en el futuro, deberán tener sus correspondientes políticas de acceso. Esta integración solo utiliza Supabase Auth.
