
"use strict";
const $=id=>document.getElementById(id),valor=id=>$(id).value.trim();
const eur=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const num=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(n);
const red=n=>Math.round((n+Number.EPSILON)*100)/100;
const TRAMOS=[[300,42],[600,36],[1200,30],[3000,22],[4000,20],[6000,18],[12000,17],[18000,16],[24000,12],[30000,11],[40000,10],[50000,9],[60000,8],[120000,7],[300000,6.5],[600000,5],[1200000,2.5],[1800000,2],[2500000,1.75],[3500000,1.5],[Infinity,1]];
const REGLAS=[];
function regla(id,nombre,articulo,pagina,tipo,pct,min,nota,extra={}){REGLAS.push({id,nombre,articulo,pagina,tipo,pct,min,nota,...extra});}
regla('ordinario','Civil · juicio ordinario por cuantía','15',16,'escala',100,2000,'Base: cuantía litigiosa. En tasación frente al demandado condenado por cantidad inferior, utiliza la cantidad fijada en sentencia. Incidencias y recursos aparte.',{fases:'ordinario'});
regla('verbal','Civil · juicio verbal por cuantía','13',13,'escala',100,500,'Base: cuantía litigiosa, con el ajuste a la condena inferior previsto para tasación. Incidencias y recursos aparte.',{fases:'verbal'});
regla('arbitraje','Arbitraje de derecho','1',10,'escala',75,600,'Honorarios del defensor de cada parte.');
regla('equidad','Arbitraje de equidad','2',11,'escala',60,600,'Honorarios del defensor de cada parte.');
regla('conciliacion','Demanda de conciliación','3',11,'fijo',0,150,'Redacción de papeleta o demanda.');
regla('conciliacion-no','Conciliación sin avenencia','4.b',11,'fijo',0,150,'Solo asistencia al acto.');
regla('preliminares','Diligencias preliminares sin oposición','5.a',11,'fijo',0,350,'Artículo 256 LEC.');
regla('preliminares-op','Diligencias preliminares con oposición','5.b',11,'fijo',0,400,'Supuesto con oposición.');
regla('incidente','Incidente con cuantía propia','8',12,'escala',40,300,'Base: cuantía propia distinta del principal.');
regla('excesivos','Impugnación de honorarios por excesivos','11',13,'escala',5,100,'Base: reducción de la minuta; sin reducción, cantidad discutida.');
regla('indebidos','Impugnación de honorarios por indebidos','12',13,'escala',100,300,'Base: partidas impugnadas.');
regla('monitorio','Monitorio sin oposición','47',35,'escala',50,150,'Base: cantidad del requerimiento. Hasta auto despachando ejecución. Ejecución posterior aparte.');
regla('monitorio-op','Monitorio con oposición, mismo letrado','48.1',35,'escala',10,150,'Solo fase monitoria. El declarativo posterior se calcula aparte.');
regla('ejecutiva','Ejecución judicial · demanda y trámites hasta apremio','27.1',23,'escala',20,150,'Base según el art. 27: conceptos despachados, con sus límites y ajustes. Incluye diligencias hasta el inicio del apremio, no solo redactar la demanda.');
regla('oposicion','Ejecución judicial · incidente de oposición','27.2',23,'escala',20,300,'Base: cuantía discutida con intereses y costas conforme al art. 27. No supone automáticamente el mismo importe que la demanda ejecutiva.');
regla('apremio27','Ejecución judicial · apremio y/o subasta','27.3',23,'apremio',0,150,'Iniciales hasta petición de realización: 10%. Restantes, incluida celebración de subasta: otro 10%. La aplicación interpreta el criterio inferior de 150 € una vez para este conjunto; revisa su aplicación profesional.');
regla('extrajudicial','Ejecución extrajudicial · hasta apremio','28.1',24,'escala',65,150,'Base: conceptos despachados, límites y ajustes del artículo 28.');
regla('extra-op-actor','Oposición extrajudicial · ejecutante','28.2',24,'escala',35,300,'Base: cuantía discutida con intereses y costas.');
regla('extra-op-demandado','Oposición extrajudicial · ejecutado','28.2',24,'escala',100,300,'Base: cuantía discutida con intereses y costas.');
regla('apremio28','Ejecución extrajudicial · apremio y/o subasta','28.3',24,'apremio',0,150,'Iniciales: 10%. Restantes, incluida celebración de subasta: otro 10%. Se aplica el criterio inferior de 150 € una vez para el conjunto seleccionado, sujeto a revisión profesional.');
regla('apelacion','Apelación civil de ordinario','50',37,'honorarios',50,1000,'Introduce honorarios de primera instancia correspondientes al objeto de la alzada. Excluye vista, prueba y sesiones adicionales.');
regla('apelacion-verbal','Apelación civil de verbal por cuantía','50',37,'honorarios',50,300,'Honorarios de primera instancia correspondientes al objeto de la alzada. Excluye vista y prueba.');
regla('detenido','Penal · asistencia al detenido, preso o víctima','69',48,'fijo',0,200,'Incluye la salida. Añade por separado asistencias distintas que realmente se hayan devengado.',{repetible:true});
regla('situacion','Penal · comparecencia sobre situación personal','70',48,'fijo',0,300,'Comparecencia relativa a la situación personal de detenidos o imputados.',{repetible:true});
regla('habeas','Penal · habeas corpus','71',48,'fijo',0,300,'Procedimiento de habeas corpus.');
regla('denuncia','Penal · denuncia','73.A',49,'fijo',0,200,'Iniciación mediante denuncia.');
regla('querella','Penal · querella','73.B',49,'fijo',0,400,'Iniciación mediante querella.');
regla('tramite','Penal · escritos de mero trámite, conjunto','74.A',49,'fijo',0,100,'100 € POR TODOS los escritos de mero trámite, no por escrito. No dupliques este conjunto.');
regla('razonado','Penal · escrito razonado proponiendo diligencias','74.B',49,'fijo',0,150,'Por cada escrito razonado o fundamentado.',{repetible:true});
regla('diligencia','Penal · asistencia a diligencias en el juzgado','74',49,'fijo',0,100,'Introduce unidades minutables, no número bruto de diligencias. Si varias se evacúan en un solo acto, el texto considera una asistencia por cada dos. Revisa la agrupación del caso.',{repetible:true});
regla('diligencia-fuera','Penal · diligencias fuera del juzgado','74',49,'fijo',0,200,'Introduce unidades minutables tras revisar la regla de agrupación del artículo 74.',{repetible:true});
regla('declaracion','Penal · asistencia a declaración judicial','74',49,'fijo',0,150,'Incluida emisión de informe pericial. Revisa la agrupación de varias diligencias en un solo acto; introduce unidades ya determinadas.',{repetible:true});
regla('escrito-personal','Penal · escrito sobre situación personal','75',50,'fijo',0,200,'Escritos que afectan a la situación personal de imputados o procesados.',{repetible:true});
regla('acusacion','Penal · escrito de acusación, procedimiento abreviado','77',50,'fijo',0,300,'Incluye instrucción del escrito, apertura de juicio oral, calificación y proposición de prueba cuando proceda.');
regla('defensa','Penal · escrito de defensa, procedimiento abreviado','77',50,'fijo',0,300,'Incluye instrucción del escrito, calificación jurídica y proposición de prueba.');
regla('social','Social · reclamación de cantidad','127',64,'escala',100,500,'Incluye conciliación previa judicial. Sesiones adicionales e incidencias aparte.');
regla('suplicacion','Social · recurso de suplicación','152',71,'honorarios',50,600,'Introduce honorarios de primera instancia.');
const LETRADO=[['letrado','Nombre / razón social'],['nifLetrado','NIF / CIF'],['colegiado','Número de colegiado'],['colegio','Colegio profesional'],['domicilioLetrado','Domicilio profesional'],['emailLetrado','Correo'],['telefonoLetrado','Teléfono']];
const DOCUMENTO=[['numeroMinuta','Referencia'],['fecha','Fecha','date']];
const CLIENTE=[['cliente','Nombre / razón social'],['nifCliente','NIF / CIF'],['domicilioCliente','Domicilio'],['emailCliente','Correo'],['telefonoCliente','Teléfono']];
const PROCEDIMIENTO=[['autos','Autos / expediente'],['nig','NIG'],['juzgado','Juzgado / tribunal'],['asunto','Descripción','textarea']];
const CLAVE='honorarios-alicante-despacho-v1';
let partidas=[],logos={logo:'',logoIcali:''},cargas=0;
const versiones={logo:0,logoIcali:0};
function nodo(tag,texto,clase){const n=document.createElement(tag);if(texto!==undefined)n.textContent=texto;if(clase)n.className=clase;return n;}
function campos(destino,lista){for(const[id,texto,tipo='text']of lista){const d=nodo('div');if(tipo==='textarea'||['letrado','cliente','domicilioCliente','domicilioLetrado','juzgado'].includes(id))d.className='ancho';const l=nodo('label',texto);l.htmlFor=id;const i=nodo(tipo==='textarea'?'textarea':'input');i.id=id;if(tipo!=='textarea')i.type=tipo;d.append(l,i);$(destino).append(d);}}
function leer(id){const t=valor(id);if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(t))throw Error('Usa formato español en los importes: 2.500,00.');const n=Number(t.replaceAll('.','').replace(',','.'));if(!Number.isFinite(n)||n<0||n>1e12)throw Error('Importe fuera del rango admitido.');return n;}
function escala(base){let inf=0,total=0;const filas=[];for(const[sup,pct]of TRAMOS){const parte=Math.max(0,Math.min(base,sup)-inf);if(parte){const fee=parte*pct/100;filas.push({inf,sup,pct,parte,fee});total+=fee;}if(base<=sup)break;inf=sup;}return{total:red(total),filas};}
function actual(){return REGLAS.find(r=>r.id===$('procedimiento').value);}
function actualizar(){const r=actual();$('referencia').textContent=`Art. ${r.articulo} · pág. ${r.pagina}`;$('instruccion').textContent=r.nota;$('grupoBase').hidden=r.tipo==='fijo';$('etiquetaBase').textContent=r.tipo==='honorarios'?'Honorarios de referencia (€)':'Base de cálculo del artículo (€)';$('grupoFase').hidden=!r.fases;$('grupoApremio').hidden=r.tipo!=='apremio';$('grupoUnidades').hidden=!r.repetible;$('unidades').value=1;$('notaUnidades').textContent=r.nota;$('fase').replaceChildren();const opts=[[1,'Procedimiento completo · 100%'],[.6,'Hasta alegaciones · 60%']];if(r.fases==='ordinario')opts.push([.7,'Hasta audiencia previa y proposición de prueba · 70%']);opts.push([.75,'Solo derecho, pendiente de conclusión · 75%'],[1,'Solo derecho, conclusión realizada o inexistente · 100%'],[.7,'Allanamiento previo · letrado del actor · 70%'],[.3,'Allanamiento previo · letrado allanado · 30%']);opts.forEach(([v,t])=>$('fase').add(new Option(t,v)));invalidar();}
let consultaActual=null;
function invalidar(){consultaActual=null;$('resultado').textContent='Pulsa Calcular o Añadir para actualizar esta actuación.';$('errorCalculo').textContent='';}
function calcular(){const r=actual(),base=r.tipo==='fijo'?0:leer('base'),e=escala(base);let pct=r.pct,subfases=[];if(r.tipo==='apremio'){const a=$('apremio').value;subfases=a==='ambas'?['Diligencias iniciales hasta petición de realización','Restantes diligencias, incluida celebración de subasta']:[a==='inicial'?'Diligencias iniciales hasta petición de realización':'Restantes diligencias, incluida celebración de subasta'];pct=subfases.length*10;}
const previo=r.tipo==='fijo'?r.min:(r.tipo==='honorarios'?base:e.total)*pct/100;
const completo=red(Math.max(previo,r.min));const factor=r.fases?Number($('fase').value):1;const unidades=r.repetible?Number($('unidades').value):1;if(!Number.isInteger(unidades)||unidades<1||unidades>1000)throw Error('Unidades: entero de 1 a 1.000.');
return{r,base,e,pct,subfases,previo:red(previo),completo,factor,unidades,descripcion:valor('descripcion'),fase:r.fases?$('fase').selectedOptions[0].textContent:'Actuación completa',importe:red(completo*factor*unidades)};}
function fila(t,v,clase=''){const d=nodo('div',undefined,'fila '+clase);d.append(nodo('span',t),nodo('span',eur(v)));return d;}
function explicacion(c){const d=nodo('div',undefined,'pasos');d.append(nodo('h3','Cómo se obtiene la escala'));const u=c.e.filas.at(-1);if(!u){d.append(nodo('p','Base 0 €: escala 0 €.'));return d;}const acum=red(c.e.filas.slice(0,-1).reduce((s,t)=>s+t.fee,0));[`1. Hasta ${eur(u.inf)}, acumulado: ${eur(acum)}.`,`2. Exceso: ${eur(c.base)} − ${eur(u.inf)} = ${eur(u.parte)}.`,`3. ${eur(u.parte)} × ${num(u.pct)}% = ${eur(u.fee)}.`,`4. Escala: ${eur(acum)} + ${eur(u.fee)} = ${eur(c.e.total)}.`].forEach(t=>d.append(nodo('p',t)));d.append(nodo('p','La escala se suma sin redondeos intermedios y se redondea a céntimos al final. Los pasos se muestran redondeados. Límites continuos para admitir céntimos.','nota'));return d;}
function detalle(c){const d=nodo('div');if(c.r.tipo!=='fijo')d.append(fila(c.r.tipo==='honorarios'?'Honorarios de referencia':'Base de cálculo',c.base));if(c.r.tipo==='apremio'){c.subfases.forEach(t=>d.append(fila(t+' · 10%',red(c.e.total*.1))));d.append(fila('Suma de fases antes del criterio inferior',c.previo));}else if(c.r.tipo!=='fijo')d.append(fila(`${num(c.pct)}% ${c.r.tipo==='honorarios'?'de honorarios':'de escala'}`,c.previo));d.append(fila(c.r.tipo==='fijo'?'Importe por unidad':'Honorarios completos tras criterio inferior',c.completo));if(c.factor!==1)d.append(nodo('p',c.fase,'nota'));if(c.unidades>1)d.append(nodo('p',`${c.unidades} unidades × ${eur(c.completo)}`,'nota'));d.append(fila('Honorarios de esta actuación',c.importe,'total'));return d;}
function mostrar(c){
 const iva=leer('iva'),irpf=$('finalidad').value==='costas'?0:leer('irpf');
 if(iva>100||irpf>100)throw Error('IVA e IRPF deben estar entre 0 y 100%.');
 const cuota=red(c.importe*iva/100),conIva=red(c.importe+cuota),retencion=red(c.importe*irpf/100);
 consultaActual=c;
 $('resultado').replaceChildren(nodo('h3',c.r.nombre),nodo('p',eur(conIva),'importe'),nodo('p','Total con IVA · no añadida hasta pulsar Añadir','nota'));
 if(c.r.tipo==='escala'||c.r.tipo==='apremio')$('resultado').append(explicacion(c));
 $('resultado').append(detalle(c),nodo('h3','Impuestos de esta consulta'),fila('Honorarios sin IVA',c.importe),fila(`IVA · ${num(iva)}%`,cuota),fila('TOTAL CON IVA',conIva,'total'));
 if(irpf)$('resultado').append(fila(`Retención IRPF · ${num(irpf)}%`,-retencion),fila('TOTAL A ABONAR',red(conIva-retencion),'total'));
}
function actualizarConsultaFiscal(){if(!consultaActual)return;const c=consultaActual;try{mostrar(c);$('errorCalculo').textContent='';}catch(e){$('resultado').textContent='Revisa los porcentajes de impuestos.';$('errorCalculo').textContent=e.message;}}

function anadir(){try{const c=calcular();if(['apremio27','apremio28','tramite'].includes(c.r.id)&&partidas.some(p=>p.r.id===c.r.id))throw Error('Este conjunto ya está añadido. Elimínalo y vuelve a añadirlo con las fases correctas para no duplicar conceptos o criterios inferiores.');partidas.push(c);mostrar(c);renderLista();$('errorCalculo').textContent='';}catch(e){$('errorCalculo').textContent=e.message;}}
function totales(){const iva=leer('iva'),irpf=$('finalidad').value==='costas'?0:leer('irpf');if(iva>100||irpf>100)throw Error('IVA e IRPF deben estar entre 0 y 100%.');const base=red(partidas.reduce((s,c)=>s+c.importe,0)),cuota=red(base*iva/100),retencion=red(base*irpf/100);return{base,iva,irpf,cuota,retencion,total:red(base+cuota-retencion)};}
function desgloseTotal(t){const d=nodo('div');d.append(fila('Suma de honorarios',t.base),fila(`IVA · ${num(t.iva)}%`,t.cuota));if(t.irpf)d.append(fila(`Retención IRPF · ${num(t.irpf)}%`,-t.retencion));d.append(fila($('finalidad').value==='costas'?'TOTAL PROPUESTO':'TOTAL A ABONAR',t.total,'total'));return d;}
function renderTotales(){$('errorMinuta').textContent='';try{$('totales').replaceChildren(desgloseTotal(totales()));}catch(e){$('totales').replaceChildren();$('errorMinuta').textContent=e.message;}}
function renderLista(){$('minuta').replaceChildren();$('lista').replaceChildren();if(!partidas.length)$('lista').append(nodo('p','Todavía no has añadido actuaciones.','nota'));partidas.forEach((c,i)=>{const d=nodo('div',undefined,'partida');d.append(nodo('h3',`${i+1}. ${c.r.nombre}`),nodo('p',`Art. ${c.r.articulo} · pág. ${c.r.pagina} · ${eur(c.importe)}`,'nota'));if(c.descripcion)d.append(nodo('p',c.descripcion));if(c.unidades>1)d.append(nodo('p',`${c.unidades} unidades minutables`,'nota'));const b=nodo('button','Eliminar','secundario');b.type='button';b.onclick=()=>{partidas.splice(i,1);renderLista();};d.append(b);$('lista').append(d);});renderTotales();}
function finalidad(){const c=$('finalidad').value==='costas';$('grupoIrpf').hidden=c;$('avisoFinalidad').textContent=c?'Propuesta para costas: revisa partidas incluibles, base y límites legales. La app no los determina ni limita automáticamente.':'Honorarios al cliente: sujetos a pacto. Estos criterios no constituyen una tarifa obligatoria.';$('minuta').replaceChildren();renderTotales();actualizarConsultaFiscal();}
function logoValido(v){return typeof v==='string'&&v.length<1500000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v);}
function mostrarLogos(){for(const[key,id]of[['logo','vistaLogo'],['logoIcali','logoIcaliCabecera']]){$(id).hidden=!logos[key];if(logos[key])$(id).src=logos[key];else $(id).removeAttribute('src');}}
async function cargarLogo(key,id){const archivo=$(id).files[0];if(!archivo)return;const version=++versiones[key];cargas++;$('estadoGuardado').textContent='Procesando imagen…';try{if(!['image/png','image/jpeg','image/webp'].includes(archivo.type)||archivo.size>1024*1024)throw Error('Usa PNG, JPG o WebP de hasta 1 MB.');const datos=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(Error('No se pudo leer la imagen.'));r.readAsDataURL(archivo);});await new Promise((ok,no)=>{const i=new Image();i.onload=ok;i.onerror=()=>no(Error('Imagen no válida.'));i.src=datos;});if(version!==versiones[key])return;if(!logoValido(datos))throw Error('Imagen no admitida.');logos[key]=datos;mostrarLogos();$('estadoGuardado').textContent='Imagen cargada. Pulsa Guardar para conservarla.';}catch(e){if(version===versiones[key])$('estadoGuardado').textContent=e.message;}finally{cargas--;}}
function guardar(){if(cargas){$('estadoGuardado').textContent='Espera a que terminen de cargarse las imágenes.';return;}const datos={version:1,...logos};LETRADO.forEach(([id])=>datos[id]=valor(id));try{localStorage.setItem(CLAVE,JSON.stringify(datos));$('estadoGuardado').textContent='Datos y logos guardados en este navegador.';}catch{$('estadoGuardado').textContent='No se pudo guardar. Revisa espacio y permisos del navegador. Puedes seguir usando la app.';}}
function recuperar(){try{const raw=localStorage.getItem(CLAVE);if(!raw)return;const d=JSON.parse(raw);if(!d||d.version!==1)return;LETRADO.forEach(([id])=>{if(typeof d[id]==='string')$(id).value=d[id];});for(const key of ['logo','logoIcali'])logos[key]=logoValido(d[key])?d[key]:'';mostrarLogos();$('estadoGuardado').textContent='Datos guardados recuperados.';}catch{$('estadoGuardado').textContent='Almacenamiento no disponible. La app funciona sin guardar datos.';}}
function quitar(key,id){versiones[key]++;logos[key]='';$(id).value='';mostrarLogos();$('estadoGuardado').textContent='Imagen quitada. Pulsa Guardar para actualizar los datos guardados.';}
function dato(d,t,v){if(!v)return;const p=nodo('p');if(t)p.append(nodo('strong',t+': '));p.append(document.createTextNode(v));d.append(p);}
function parte(t,campos){const d=nodo('section',undefined,'bloque');d.append(nodo('h2',t));let hay=false;campos.forEach(([id,label])=>{if(valor(id)){dato(d,label,valor(id));hay=true;}});return hay?d:null;}
function docParte(titulo,lista){
 const d=nodo('section',undefined,'doc-party');
 d.append(nodo('p',titulo,'doc-label'));
 const nombre=lista[0][0];
 d.append(nodo('h3',valor(nombre)||'Datos no indicados'));
 for(const[id,label]of lista.slice(1))dato(d,label,valor(id));
 return d;
}
function docActuaciones(){
 const table=nodo('table',undefined,'doc-items');
 const head=table.createTHead().insertRow();
 for(const title of ['N.º','Actuación profesional','Criterio','Base / referencia','Honorarios']){
  const th=nodo('th',title);th.scope='col';head.append(th);
 }
 const body=table.createTBody();
 partidas.forEach((c,i)=>{
  const row=body.insertRow();row.insertCell().textContent=String(i+1).padStart(2,'0');
  const concept=row.insertCell();concept.append(nodo('strong',c.r.nombre));
  if(c.descripcion)concept.append(nodo('p',c.descripcion,'doc-description'));
  if(c.factor!==1)concept.append(nodo('p',c.fase,'doc-description'));
  if(c.unidades>1)concept.append(nodo('p',`${c.unidades} unidades minutables × ${eur(c.completo)}`,'doc-description'));
  if(c.r.tipo==='apremio')for(const fase of c.subfases)concept.append(nodo('p',`${fase} · 10%: ${eur(red(c.e.total*.1))}`,'doc-description'));
  if(c.r.tipo!=='fijo'&&c.previo<c.r.min)concept.append(nodo('p',`Aplicado criterio inferior: ${eur(c.r.min)}`,'doc-description'));
  row.insertCell().textContent=`Art. ${c.r.articulo}\nPág. ${c.r.pagina}`;
  row.insertCell().textContent=c.r.tipo==='fijo'?'Importe fijo':eur(c.base);
  row.insertCell().textContent=eur(c.importe);
 });
 return table;
}
async function pdf(){
 $('errorMinuta').textContent='';
 try{
  if(!partidas.length)throw Error('Añade al menos una actuación a la minuta.');
  if(cargas)throw Error('Espera a que terminen de cargarse las imágenes.');
  const t=totales(),costas=$('finalidad').value==='costas',h=$('minuta');h.replaceChildren();
  const header=nodo('header',undefined,'doc-header');
  const identity=nodo('div',undefined,'doc-identity');
  if(logos.logo){const image=nodo('img');image.src=logos.logo;image.alt='Logo del despacho';image.className='doc-logo';identity.append(image);}
  identity.append(nodo('p',valor('letrado')||'MINUTA PROFESIONAL','doc-office'));
  if(valor('colegiado')||valor('colegio'))identity.append(nodo('p',[valor('colegiado')?'Col. '+valor('colegiado'):'',valor('colegio')].filter(Boolean).join(' · '),'doc-description'));
  const meta=nodo('div',undefined,'doc-meta');
  meta.append(nodo('p','DOCUMENTO DE HONORARIOS','doc-label'));
  if(valor('numeroMinuta'))dato(meta,'Referencia',valor('numeroMinuta'));
  if(valor('fecha'))dato(meta,'Fecha',valor('fecha').split('-').reverse().join('/'));
  if(!valor('numeroMinuta'))meta.append(nodo('p','Borrador sin referencia','doc-description'));
  header.append(identity,meta);h.append(header);
  const title=nodo('section',undefined,'doc-title');
  title.append(nodo('p',costas?'TASACIÓN DE COSTAS · PROPUESTA':'SERVICIOS PROFESIONALES DE ABOGACÍA','doc-label'),nodo('h1',costas?'Propuesta de minuta':'Minuta de honorarios'),nodo('p','Relación de actuaciones profesionales y valoración económica.','doc-subtitle'));h.append(title);
  const parties=nodo('div',undefined,'doc-parties');parties.append(docParte('01 / LETRADO · EMISOR',LETRADO),docParte(costas?'02 / CLIENTE · PARTE REPRESENTADA':'02 / CLIENTE · DESTINATARIO',CLIENTE));h.append(parties);
  if(PROCEDIMIENTO.some(([id])=>valor(id))){
   const matter=nodo('section',undefined,'doc-matter');matter.append(nodo('p','PROCEDIMIENTO / EXPEDIENTE','doc-label'));
   for(const[id,label]of PROCEDIMIENTO)if(valor(id))dato(matter,label,valor(id));h.append(matter);
  }
  h.append(nodo('h2','Actuaciones minutadas','doc-section-title'),docActuaciones());
  const closing=nodo('section',undefined,'doc-closing');
  const taxes=nodo('div',undefined,'doc-taxes');taxes.append(fila('Honorarios profesionales',t.base),fila(`IVA · ${num(t.iva)}%`,t.cuota));
  if(t.irpf)taxes.append(fila(`Retención IRPF · ${num(t.irpf)}%`,-t.retencion));
  taxes.append(fila(costas?'TOTAL PROPUESTO':'TOTAL A ABONAR',t.total,'total'));closing.append(taxes);h.append(closing);
  if(valor('observaciones')){const obs=nodo('section',undefined,'doc-observations');obs.append(nodo('p','OBSERVACIONES / FORMA DE PAGO','doc-label'),nodo('p',valor('observaciones'),'multilinea'));h.append(obs);}
  const foot=nodo('section',undefined,'doc-foot');
  foot.append(nodo('p',costas?'Propuesta sujeta a comprobación de partidas incluibles, bases, límites legales y resolución judicial. No constituye una tasación aprobada ni acredita el pago.':'Los honorarios entre cliente y abogado se pactan libremente. Este documento no acredita el pago.'));
  foot.append(nodo('p','Fuente de cálculo: documento aportado de criterios de Alicante con entrada en vigor el 15/01/2013. Vigencia actual no verificada. Herramienta privada, no oficial de ICALI.'));
  foot.append(nodo('p','Aplicación creada por PABLO LÓPEZ CORONADO · ABOGADO · COL. 8872 ICALI.','doc-credit'));h.append(foot);
  if($('incluirAnexo')?.checked){
   const annex=nodo('section',undefined,'doc-annex');annex.append(nodo('p','ANEXO TÉCNICO','doc-label'),nodo('h1','Fundamento del cálculo'),nodo('p','Detalle de bases, escala y criterios aplicados. No constituye un importe adicional.','doc-subtitle'));
   partidas.forEach((c,i)=>{const block=nodo('section',undefined,'doc-annex-item');block.append(nodo('h2',`${String(i+1).padStart(2,'0')}. ${c.r.nombre}`),nodo('p',`Artículo ${c.r.articulo} · página ${c.r.pagina} del documento fuente.`,'doc-description'),nodo('p',c.r.nota,'doc-description'));if(c.descripcion)block.append(nodo('p',c.descripcion));if(c.r.tipo==='escala'||c.r.tipo==='apremio')block.append(explicacion(c));block.append(detalle(c));annex.append(block);});h.append(annex);
  }
  const image=h.querySelector('img');if(image)await image.decode();
  const old=document.title;document.title=(costas?'Propuesta costas':'Minuta')+(valor('numeroMinuta')?' '+valor('numeroMinuta'):'');
  try{window.print();}finally{document.title=old;}
 }catch(e){$('errorMinuta').textContent=e.message;}
}

campos('camposLetrado',LETRADO);campos('camposDocumento',DOCUMENTO);campos('camposCliente',CLIENTE);campos('camposProcedimiento',PROCEDIMIENTO);REGLAS.forEach(r=>$('procedimiento').add(new Option(r.nombre,r.id)));const hoy=new Date();$('fecha').value=[hoy.getFullYear(),String(hoy.getMonth()+1).padStart(2,'0'),String(hoy.getDate()).padStart(2,'0')].join('-');
$('procedimiento').onchange=actualizar;$('finalidad').onchange=finalidad;$('calculadora').oninput=e=>{if(e.target.id!=='finalidad')invalidar();};$('calculadora').onsubmit=e=>{e.preventDefault();try{mostrar(calcular());$('errorCalculo').textContent='';}catch(x){$('errorCalculo').textContent=x.message;}};$('anadir').onclick=anadir;$('iva').oninput=()=>{renderTotales();actualizarConsultaFiscal();};$('irpf').oninput=()=>{renderTotales();actualizarConsultaFiscal();};$('vaciar').onclick=()=>{if(partidas.length&&confirm('¿Vaciar todas las actuaciones?')){partidas=[];renderLista();}};$('archivoLogo').onchange=()=>cargarLogo('logo','archivoLogo');$('archivoIcali').onchange=()=>cargarLogo('logoIcali','archivoIcali');$('quitarLogo').onclick=()=>quitar('logo','archivoLogo');$('quitarIcali').onclick=()=>quitar('logoIcali','archivoIcali');$('guardarDespacho').onclick=guardar;$('borrarDespacho').onclick=()=>{if(!confirm('¿Borrar los datos y logos guardados?'))return;try{localStorage.removeItem(CLAVE);LETRADO.forEach(([id])=>$(id).value='');quitar('logo','archivoLogo');quitar('logoIcali','archivoIcali');$('estadoGuardado').textContent='Datos guardados eliminados.';}catch{$('estadoGuardado').textContent='No se pudieron borrar los datos guardados.';}};$('generarPdf').onclick=pdf;actualizar();recuperar();finalidad();renderLista();mostrar(calcular());
