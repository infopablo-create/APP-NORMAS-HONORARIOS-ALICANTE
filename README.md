# APP-NORMAS-HONORARIOS-ALICANTE

Aplicación de honorarios creada por **Pablo López Coronado, abogado, col. 8872 ICALI**. Herramienta privada basada en el PDF aportado de criterios de Alicante de 2013; no es una aplicación oficial del Colegio y no se ha verificado la vigencia actual de los criterios.

## Abrir la aplicación

Página publicada: https://infopablo-create.github.io/APP-NORMAS-HONORARIOS-ALICANTE/

El `index.html` de la raíz contiene la calculadora autónoma con IVA provisional, varias actuaciones, agenda local de clientes, logos y minuta A4 con anexo opcional. Se puede abrir como archivo local para calcular. El acceso con cuenta se utiliza en la dirección web publicada.

**No hay suscripción, planes ni cobros.** El registro y los accesos por Google y Microsoft/Outlook se conectan mediante Supabase Auth. Hasta configurar el proyecto público y habilitar cada proveedor, los controles permanecen desactivados y se muestra una explicación. No se simula una sesión iniciada.

## Configurar el acceso real

Sigue [AUTH_SETUP.md](AUTH_SETUP.md). Hace falta la Project URL y una Publishable key (o anon), que son públicas. Las credenciales privadas de Google y Microsoft se introducen en Supabase, nunca en el repositorio.

La web usa el SDK oficial empaquetado en `auth.js`, el flujo PKCE, registro por correo, contraseña, comprobación de la sesión con el servicio y cierre de sesión. Puede pedir confirmar el correo, según la configuración del proyecto. No incluye recuperación automática de contraseña. Google y Microsoft se activan en la interfaz solo si el proyecto los anuncia como habilitados.

## Desarrollo y compilación

Node.js 24 o superior:

```sh
npm ci
npm run build:auth
npm test
npm start
```

`npm run build:auth` empaqueta el SDK sin CDN y copia los recursos de acceso a `public/`. Los recursos compilados se incluyen en Git para que GitHub Pages no necesite una compilación adicional. `THIRD_PARTY_NOTICES.txt` incluye las licencias de dependencias distribuidas.

El servidor local escucha por defecto en `127.0.0.1:3000`. Se pueden configurar `HOST` y `PORT`. Mantiene la API histórica de cuentas SQLite para compatibilidad y sus pruebas; la interfaz actual publicada utiliza Supabase, no esa API local. Sus cuentas no se migran automáticamente a Supabase. La base de datos local está en `data/accounts.sqlite` o `APP_DB_PATH`, fuera de la carpeta pública y excluida de Git.

Utiliza el checkout existente: cada tarea cloud ya está aislada y no necesita un worktree.

## Agenda y datos

La agenda se guarda solo en el navegador y perfil por decisión del usuario. Permite alta, edición, búsqueda por nombre/NIF/correo sin distinguir tildes, selección para la minuta, eliminación y copia JSON exportable/importable. Evita NIF duplicados y rechaza importaciones conflictivas o ediciones obsoletas antes de sobrescribir.

Un cliente puede seleccionarse en distintos asuntos. Editar sus datos en la minuta no modifica automáticamente la ficha. Al eliminarlo de la agenda, los datos ya copiados a una minuta se conservan. Cliente seleccionado, expediente y actuaciones actuales no se conservan al recargar; las fichas guardadas y los datos guardados del despacho sí permanecen en el navegador cuando este permite localStorage.

No hay sincronización entre dispositivos ni separación de la agenda por cuenta: las personas que usan el mismo perfil de navegador comparten ese almacenamiento. Exporta una copia para conservar o trasladar la agenda. La autenticación no convierte los archivos estáticos en contenido privado ni sube automáticamente datos de clientes a Supabase.

## Minuta y criterios

- Consulta sin datos personales; IVA editable en resultado provisional y total de minuta. IRPF editable solo en honorarios al cliente.
- Varias actuaciones con bases independientes y unidades minutables en las actuaciones penales habilitadas.
- Minuta A4 con cabecera, datos de partes, tabla de conceptos, impuestos y total. Anexo técnico opcional en páginas separadas. El PDF se obtiene mediante la impresión del navegador.
- Logo del despacho opcional; el logo original de ICALI puede cargarse en la cabecera de la app. No se incluye un logo inventado.
- Escala progresiva de la página 73: acumulado anterior, exceso, porcentaje marginal y suma. Se interpreta de forma continua para admitir céntimos y se redondea el total de escala a céntimos, sin redondeos por tramo.
- Artículos 13 y 15: criterio inferior antes del reparto de fases. Recursos basados en honorarios: se introducen honorarios de referencia, no cuantía para volver a aplicar la escala.
- Artículos 27.3 y 28.3: 10% de fases iniciales y otro 10% de restantes, incluida subasta. La app interpreta el criterio inferior de 150 € una vez para el conjunto seleccionado y bloquea duplicarlo. Esta interpretación está indicada y requiere revisión profesional.
- Art. 74.A: 100 € por el conjunto de escritos de mero trámite, no por cada escrito. Para diligencias penales, el profesional introduce unidades ya minutables tras aplicar la regla de agrupación que corresponda.

El modo costas no determina partidas incluibles ni aplica límites legales. No automatiza cuantía indeterminada, reconvenciones, pluralidad de letrados, transacciones, sesiones adicionales, suplidos ni gastos. No integra VERI*FACTU ni emite facturas fiscales.

## Archivos principales

- `index.html`: página principal de GitHub Pages y calculadora integrada.
- `auth-config.js`: configuración pública editable del proyecto de acceso.
- `src/auth.js`, `scripts/build-auth.mjs`, `auth.js`: código fuente y SDK compilado.
- `AUTH_SETUP.md`: configuración de correo, Google y Microsoft.
- `public/`: interfaz modular para desarrollo local y copia del HTML autónomo.
- `Alicante.pdf`, `public/Alicante.pdf`: fuente aportada.
- `server.js`, `test/`: servidor local y pruebas.

La integración de autenticación se comprueba con un proyecto simulado en las pruebas de navegador. El acceso real con los proveedores queda pendiente de las credenciales públicas del proyecto y de la configuración de Google/Microsoft; no se afirma que esté activado hasta comprobarlo.
