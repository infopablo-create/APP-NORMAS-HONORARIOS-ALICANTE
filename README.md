# APP-NORMAS-HONORARIOS-ALICANTE

Aplicación de honorarios de Pablo López Coronado, abogado, col. 8872 ICALI.

## Abrir sin instalación

Abre **[index.html](index.html)** en Chrome, Edge o Firefox. Incluye calculadora con IVA provisional, varias actuaciones, agenda local de clientes con buscador, logos y minuta A4 con anexo opcional para guardar como PDF. El PDF fuente está en `Alicante.pdf`.

En esta versión HTML, registro, acceso con Google y suscripción son vistas previas desactivadas. No crea cuentas ni realiza cobros. La agenda y el despacho se guardan solo en ese navegador cuando se utilizan sus opciones de guardar; exporta la agenda para conservar una copia. No se incluyen datos reales de clientes en este repositorio.

Para publicar esta versión en GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root) → Save. Esa publicación no activa cuentas, Google, pagos ni VERI*FACTU. La publicación de Pages todavía no se ha realizado desde esta tarea.

## Versión con servidor

La versión con servidor Node se documenta a continuación. GitHub Pages solo puede servir la versión HTML estática.


Aplicación privada creada por Pablo López Coronado, abogado, col. 8872 ICALI. Interfaz burdeos, blanca y gris inspirada en la referencia facilitada; no es una aplicación oficial del Colegio.

## Arranque

Requiere Node.js 24 o superior. No tiene paquetes externos ni necesita compilación.

```sh
cd /workspace/APP-NORMAS-HONORARIOS-ALICANTE
npm start
```

`npm run dev` reinicia el servidor ante cambios; `npm test` ejecuta las pruebas de cálculo y de cuentas. El servidor escucha por defecto en `127.0.0.1:3000`; `PORT` y `HOST` son configurables. Las pruebas de HTTP y el servidor necesitan permiso para abrir sockets en este entorno.

Utiliza el checkout existente: cada tarea cloud está aislada y no necesita un worktree.

## Funciones

- Inicio, calculadora, cuenta, registro y suscripción, con navegación adaptada a móvil.
- Consulta sin cuenta ni datos personales.
- Varias actuaciones con bases independientes, unidades en actuaciones penales habilitadas, eliminación y suma conjunta.
- Demanda ejecutiva y trámites hasta apremio, oposición y grupo de apremio con fases inicial y final, incluida subasta.
- Datos y logo del despacho guardables expresamente en el navegador. Campo separado para cargar el logo auténtico de ICALI en la cabecera de la app; el recurso original no se incluye.
- Propuesta de minuta para costas o minuta al cliente, imprimible y guardable como PDF mediante el navegador.
- Registro e inicio de sesión reales con SQLite, huellas scrypt de contraseñas y sesiones de siete días en cookies HttpOnly/SameSite. Los tokens de sesión se guardan como hashes en la base de datos. Hay comprobación de origen, consultas parametrizadas y límites de intentos por IP.

El fichero `public/visualizar.html` es una copia de la versión autónoma `index.html`. La aplicación con cuentas es `public/index.html` servida por `server.js`; no funciona con cuentas reales abriendo el HTML desde el Bloc de notas. Los scripts externos y las llamadas `/api` requieren el servidor.

## Cuentas y datos

La base de datos se crea en `data/accounts.sqlite`, fuera del directorio público y excluida de Git. Se puede configurar su ubicación con `APP_DB_PATH`. Hay que conservar ese archivo para conservar las cuentas. El almacenamiento del despacho sigue siendo local al navegador; no se sincroniza con la cuenta y puede ser visible para otras personas que usen el mismo perfil de navegador. Cliente, expediente y lista de actuaciones no se persisten tras recargar.

Para una instalación pública se necesita alojamiento Node con almacenamiento persistente y HTTPS. Configurar `NODE_ENV=production` para cookies Secure y `PUBLIC_ORIGIN` con el origen HTTPS exacto. No se configura HTTPS ni se publica un sitio desde este repositorio. Esta versión no incluye verificación del correo, recuperación de contraseña, correo transaccional, gestión de bajas ni sincronización del despacho entre dispositivos. No se han contratado ni conectado servicios externos.

## Suscripción

Precio confirmado por el usuario: **3,99 € al mes**. Se muestra en la sección de suscripción. La contratación y los cobros están desactivados; `/api/plans` devuelve `billingEnabled: false`, precio en céntimos e intervalo mensual. No hay checkout, cargos, periodo de prueba ni una suscripción activada al registrarse. Falta conectar un proveedor de pagos y concretar las condiciones e impuestos antes de habilitar contratación. No hay plan anual definido.

## Criterios de cálculo

Fuente: `public/Alicante.pdf`, 73 páginas, entrada en vigor el 15/01/2013. No se ha verificado su vigencia actual. Son criterios para dictámenes a requerimiento judicial; no son una tarifa obligatoria para clientes.

La escala de la página 73 es progresiva. Se comprueba contra los 20 acumulados de su columna «100%», y al exceso sobre 3.500.000 € se le aplica el 1%. Los intervalos se interpretan de forma continua para admitir céntimos. Se suma sin redondeos intermedios por tramo y se redondea la escala total a céntimos. El resultado muestra acumulado anterior, exceso, porcentaje marginal y suma.

En los artículos 13 y 15 se aplica el criterio inferior antes de repartir fases. Los recursos basados en honorarios piden honorarios de referencia; no se les vuelve a aplicar la escala. El monitorio con oposición no incluye el posterior declarativo.

Para los arts. 27.3 y 28.3 se permite seleccionar fases iniciales (10%), restantes incluida subasta (10%) o ambas (20%). La implementación interpreta el criterio inferior de 150 € una sola vez para el conjunto seleccionado y bloquea añadir dos veces ese conjunto a la misma minuta. Es una interpretación expresamente visible que requiere revisión profesional. Las dos fases aparecen desglosadas dentro de una actuación, sin sumarlas otra vez como conceptos independientes. No se automatiza la agrupación de diligencias penales: el profesional introduce las unidades ya minutables según el art. 74. Los escritos de mero trámite del art. 74.A se tratan como un conjunto de 100 €, no como 100 € por escrito.

El IVA es editable e independiente del PDF; inicialmente 21%. La retención IRPF, solo en honorarios al cliente, es editable e inicialmente 0%. El modo costas no fija qué partidas son incluibles ni aplica automáticamente límites legales. No automatiza cuantía indeterminada, reconvención, pluralidad de letrados, transacciones, sesiones adicionales, suplidos ni gastos.

## Archivos

- `server.js`: servidor HTTP y API de cuentas.
- `public/index.html`, `site.css`, `site.js`: sitio, navegación, cuentas y suscripción.
- `public/calculator.js`, `calculator.css`: calculadora con actuaciones y minuta.
- `public/engine.js`: motor inicial, validado contra acumulados de la escala.
- `public/Alicante.pdf`, `source.json`: fuente y transcripción.
- `test/`: pruebas de cálculo y de cuentas.

Validado con 35 pruebas automatizadas y comprobación funcional en Chromium de ejecución, actuaciones penales, generación de minuta, registro, sesión tras recarga, cierre, precio y diseño móvil. Los pagos y la publicación pública no están validados porque no están conectados.

## Agenda local de clientes

La versión HTML autónoma `public/visualizar.html` y la interfaz web incluyen agenda local por elección del usuario. `public/clients.js` implementa alta, edición, búsqueda por nombre/NIF/correo sin distinguir tildes, selección para la minuta, eliminación y copia JSON exportable/importable. Los datos se guardan en la clave `honorarios-alicante-clientes-v1` de localStorage, separados de los datos del despacho. El cliente seleccionado se copia a la minuta; no se guarda el expediente ni se actualiza la ficha por editar los campos de la minuta. Un mismo cliente puede reutilizarse en distintos asuntos.

No hay sincronización con cuentas ni entre dispositivos. Cada perfil de navegador puede acceder a su agenda; para trasladarla hay que exportar/importar una copia. Se validan los datos, se evitan NIF duplicados dentro de esa agenda y se rechazan importaciones conflictivas o ediciones de versiones obsoletas sin sobrescribir fichas. Las eliminaciones de la agenda no borran los datos ya copiados a la minuta.

Se ha preparado el botón de Google en acceso y registro, visible pero desactivado. No hay OAuth configurado, credenciales de Google ni llamadas a Google desde esta versión. Para activarlo habrá que publicar en una URL autorizada y configurar el acceso con Google. No se ha sustituido la autenticación del servidor por una simulación local.
