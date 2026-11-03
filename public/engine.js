// Fuente: Alicante.pdf, escala de la página 73. Los tipos se aplican al exceso de cada tramo.
export const BRACKETS = [[300,42],[600,36],[1200,30],[3000,22],[4000,20],[6000,18],[12000,17],[18000,16],[24000,12],[30000,11],[40000,10],[50000,9],[60000,8],[120000,7],[300000,6.5],[600000,5],[1200000,2.5],[1800000,2],[2500000,1.75],[3500000,1.5],[Infinity,1]];
export const round = n => Math.round((n+Number.EPSILON)*100)/100;
export function amount(n, name='Importe') {
  if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e12) throw Error(`${name}: introduce una cantidad entre 0 y 1.000.000.000.000.`);
  return n;
}
export function scale(base) {
  amount(base,'Base');
  let lower=0,total=0;const rows=[];
  for(const [upper,rate] of BRACKETS){
    const portion=Math.max(0,Math.min(base,upper)-lower);
    if(portion>0){const fee=portion*rate/100;total+=fee;rows.push({lower,upper,portion,rate,fee});}
    if(base<=upper)break;lower=upper;
  }
  return {total:round(total),rows};
}
const rules=[];
function add(id,title,article,page,mode,rate,min,note='',extra={}) {rules.push({id,title,article,page,mode,rate,min,note,group:'Civil',...extra});}
const s=(id,t,a,p,r,m,n='',e={})=>add(id,t,a,p,'scale',r,m,n,e);
const f=(id,t,a,p,v,n='',e={})=>add(id,t,a,p,'fixed',0,v,n,e);
const h=(id,t,a,p,r,m,n='',e={})=>add(id,t,a,p,'fee',r,m,n,e);
s('ordinary','Juicio ordinario · por cuantía','15',16,100,2000,'Base: cuantía litigiosa. En tasación frente al demandado condenado por cantidad inferior, utiliza la cantidad de la sentencia. Incidencias y recursos aparte.',{phases:'ordinary',indeterminate:2000,sessions:true});
s('verbal','Juicio verbal · por cuantía','13',13,100,500,'Base: cuantía litigiosa; en tasación frente al demandado condenado por cantidad inferior, utiliza la cantidad de la sentencia. Incidencias y recursos aparte.',{phases:'verbal',indeterminate:500,sessions:true});
s('arbitration-law','Arbitraje de derecho','1',10,75,600);
s('arbitration-equity','Arbitraje de equidad','2',11,60,600);
f('conciliation','Demanda de conciliación','3',11,150);
f('conciliation-no','Conciliación · sin avenencia','4.b',11,150);
h('conciliation-yes','Conciliación · con avenencia','4.a',11,50,200,'Introduce los honorarios completos del juicio correspondiente.');
f('preliminary','Diligencias preliminares · sin oposición','5.a',11,350);
f('preliminary-opposition','Diligencias preliminares · con oposición','5.b',11,400);
s('incident','Incidente con cuantía propia','8',12,40,300,'Base: cuantía propia, distinta de la del procedimiento principal.');
s('nullity','Nulidad de actuaciones · con cuantía propia','10',13,40,300,'Base: cuantía propia de la actuación que se pretende anular.');
s('excessive','Impugnación de honorarios · excesivos','11',13,5,100,'Base: cantidad reducida de la minuta; si no hay reducción, cantidad discutida.');
s('undue','Impugnación de honorarios · indebidos','12',13,100,300,'Base: importe de las partidas impugnadas.');
s('precarious','Verbal · recuperación de finca en precario','14.1',14,40,800,'Base: cuantía del proceso conforme a la LEC.');
s('possession','Verbal · tutela sumaria de la posesión','14.3',14,40,800,'Base: cuantía del proceso conforme a la LEC.');
s('new-work-no','Obra nueva · sin oposición','14.4.A',14,75,1000,'Base: cuantía determinada en autos.');
s('new-work-yes','Obra nueva · con oposición','14.4.B',15,100,1000,'Base: cuantía determinada en autos.');
s('horizontal','Propiedad horizontal · acciones con cuantía','16.7.A',18,100,1500,'Excluye las acciones que versan exclusivamente sobre reclamación de cantidad. Base conforme a la LEC.');
f('horizontal-no','Propiedad horizontal · acuerdo sin valoración económica','16.7.B',18,1500);
s('liquidation','Liquidación del régimen matrimonial · completa','45',34,50,1000,'Base: total haber correspondiente al cliente. No incluye actuaciones separadas de juicio verbal.');
s('payment-no','Monitorio · sin oposición','47',35,50,150,'Base: cantidad del requerimiento de pago. Hasta el auto despachando ejecución; ejecución posterior aparte.');
s('payment-yes','Monitorio · con oposición, mismo letrado','48.1',35,10,150,'Solo fase monitoria. El juicio declarativo y la ejecución se calculan por separado.');
s('payment-other-verbal','Monitorio · petición inicial por otro letrado, posterior verbal','48.1',35,60,150,'Solo honorarios del letrado que formuló la petición inicial.');
s('payment-other-ordinary','Monitorio · petición inicial por otro letrado, posterior ordinario','48.1',35,30,150,'Solo honorarios del letrado que formuló la petición inicial.');
s('judicial-execution','Ejecución de título judicial · hasta apremio','27.1',23,20,150,'Base: conceptos despachados según art. 27, con sus ajustes. No incluye oposición ni apremio.');
s('judicial-opposition','Ejecución judicial · incidente de oposición','27.2',23,20,300,'Base: cuantía discutida, con intereses y costas, según art. 27.');
s('extrajudicial','Ejecución extrajudicial · hasta apremio','28.1',24,65,150,'Base: conceptos despachados según art. 28; aplicar sus ajustes y límites.');
s('extrajudicial-claimant','Oposición extrajudicial · ejecutante','28.2',24,35,300,'Base: cuantía discutida con intereses y costas.');
s('extrajudicial-defendant','Oposición extrajudicial · ejecutado','28.2',24,100,300,'Base: cuantía discutida con intereses y costas.');
s('bill','Juicio cambiario · fase inicial','49.1',35,65,150,'Base: cantidad del requerimiento de pago o ejecución. Oposición y ejecución posterior aparte.');
h('appeal-verbal','Apelación civil · verbal por cuantía','50',36,50,300,'Honorarios de primera instancia correspondientes al objeto de la alzada. Sin vista, prueba ni sesiones adicionales.');
h('appeal-special','Apelación civil · verbal especial','50',37,50,500,'Sin vista, prueba ni sesiones adicionales. Introduce honorarios correspondientes al objeto de la alzada.');
h('appeal-ordinary','Apelación civil · ordinario','50',37,50,1000,'Sin vista, prueba ni sesiones adicionales. Introduce honorarios correspondientes al objeto de la alzada.');
s('review','Revisión, reposición o queja · con cuantía propia','51.1',37,15,300);
f('review-no','Revisión, reposición o queja · sin cuantía propia','51.1',37,300);
h('rescission','Rescisión de sentencia y audiencia al rebelde','51.3',37,50,500);
h('revision-final','Revisión de sentencia firme','51.4',37,75,0);
f('arrest','Asistencia al detenido, imputado, preso o víctima','69',48,200,'Incluye la salida.',{group:'Penal'});
f('personal','Comparecencia sobre situación personal','70',48,300,'',{group:'Penal'});
f('habeas','Habeas corpus','71',48,300,'',{group:'Penal'});
f('complaint','Denuncia penal','73.A',49,200,'',{group:'Penal'});
f('criminal-complaint','Querella','73.B',49,400,'',{group:'Penal'});
f('reasoned','Escrito razonado proponiendo diligencias · por escrito','74.B',49,150,'',{group:'Penal'});
s('administrative-short','Contencioso · procedimiento abreviado','118',60,100,500,'Incluye vista, súplica e incidencias. Revisa las reglas de cuantía de los arts. 118–120.',{group:'Contencioso',indeterminate:500});
s('administrative','Contencioso · ordinario ante Juzgado','119',61,100,2000,'Base conforme al art. 118. Para personal sin cuantía: una anualidad de haberes.',{group:'Contencioso',indeterminate:2000});
s('administrative-tsj','Contencioso · ante TSJ de la Comunidad Valenciana','120',61,100,2500,'Personal, nacimiento/extinción de relación: tres anualidades. Tributos: diferencia de cuotas. Revisa el artículo completo.',{group:'Contencioso',indeterminate:2500});
s('admin-appeal','Súplica contenciosa · con cuantía propia','121',61,15,300,'',{group:'Contencioso'});
s('labour-amount','Social · reclamación de cantidad','127',64,100,500,'Incluye conciliación previa judicial; incidencias aparte.',{group:'Social',sessions:true});
s('dismissal','Despido · procedente o rescisión desestimada','128.1.A',65,100,500,'Base: TRES MESES de salario bruto, incluida la prorrata de pagas extraordinarias.',{group:'Social'});
s('dismissal-compensation','Despido improcedente · sin readmisión','128.1.B',65,100,500,'Base: indemnización fijada en sentencia MÁS salarios de tramitación.',{group:'Social'});
s('labour-other','Social · otros juicios con cuantía determinada','144',69,100,500,'Solo supuestos no sujetos a regla específica.',{group:'Social'});
s('labour-tsj','Social · primera instancia ante TSJ','145',69,100,1800,'',{group:'Social'});
f('elections','Elecciones sindicales','139',68,500,'',{group:'Social'});
f('classification','Clasificación profesional','140',68,500,'',{group:'Social'});
f('holidays','Fijación individual de vacaciones · un trabajador','141',68,400,'Pluralidad de trabajadores no automatizada.',{group:'Social'});
h('labour-appeal','Recurso de suplicación','152',71,50,600,'Introduce honorarios del juicio de primera instancia.',{group:'Social'});
h('labour-cassation','Preparación de casación social','153',71,10,200,'',{group:'Social'});
h('labour-revision','Revisión de sentencia firme social','154',71,75,0,'',{group:'Social'});
export const RULES=rules;
export function calculate(input){
 const rule=RULES.find(r=>r.id===input.ruleId);if(!rule)throw Error('Selecciona un procedimiento válido.');
 const indeterminate=Boolean(input.indeterminate);if(indeterminate&&!rule.indeterminate)throw Error('Este supuesto exige una base determinada.');
 const base=amount(input.base??0,'Base');
 const scaled=scale(base);let raw=rule.mode==='scale'?scaled.total*rule.rate/100:rule.mode==='fee'?base*rule.rate/100:rule.min;
 if(indeterminate)raw=rule.indeterminate;
 const complete=round(Math.max(raw,rule.min));
 let factor=1;let phaseLabel='Actuación completa';
 if(rule.phases){
  const phases=rule.phases==='ordinary'?{complete:1,pleadings:.6,evidence:.7}:{complete:1,pleadings:.6};
  const key=input.phase||'complete';
  if(!(key in phases)&&!['law','law-complete','accept-actor','accept-defendant','verbal-withdrawal'].includes(key))throw Error('Fase no válida.');
  if(key==='verbal-withdrawal'&&rule.phases!=='verbal')throw Error('Desistimiento específico del juicio verbal.');
  factor=phases[key]??({'law':.75,'law-complete':1,'accept-actor':.7,'accept-defendant':.3,'verbal-withdrawal':.6}[key]);
  phaseLabel=key;
 }
 let subtotal=round(complete*factor);const lines=[{label:indeterminate?'Criterio para cuantía indeterminada':rule.mode==='fixed'?'Criterio fijo':`${rule.rate}% ${rule.mode==='fee'?'de honorarios de referencia':'de la escala'} (antes del criterio inferior)`,value:round(raw)},{label:'Honorarios completos tras criterio inferior',value:complete}];
 if(factor!==1)lines.push({label:`Fase o terminación · ${factor*100}% (DG Segunda B–D)`,value:subtotal});
 const sessions=input.sessions??0;if(!Number.isSafeInteger(sessions)||sessions<0||sessions>1000)throw Error('Sesiones: introduce un entero entre 0 y 1.000.');
 if(sessions&&!rule.sessions)throw Error('Este procedimiento no admite sesiones adicionales en esta calculadora.');
 if(sessions){subtotal=round(subtotal+sessions*150);lines.push({label:`${sessions} sesiones adicionales × 150 €`,value:sessions*150});}
 if(input.specialLaw){subtotal=round(subtotal*1.5);lines.push({label:'Legislación especial · incremento 50% (DG Tercera)',value:subtotal});}
 const vat=amount(input.vat??21,'IVA');if(vat>100)throw Error('El IVA debe estar entre 0 y 100%.');
 const tax=round(subtotal*vat/100);
 return {rule,base,indeterminate,scaled,raw:round(raw),complete,factor,phaseLabel,lines,subtotal,tax,vat,total:round(subtotal+tax),specialLaw:!!input.specialLaw,sessions};
}
