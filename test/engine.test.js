import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scale,calculate,RULES} from '../public/engine.js';
// Acumulados transcritos de la columna «100%» del PDF, página 73.
const expected=[[300,126],[600,234],[1200,414],[3000,810],[4000,1010],[6000,1370],[12000,2390],[18000,3350],[24000,4070],[30000,4730],[40000,5730],[50000,6630],[60000,7430],[120000,11630],[300000,23330],[600000,38330],[1200000,53330],[1800000,65330],[2500000,77580],[3500000,92580]];
for(const [base,total] of expected)test(`Escala PDF: ${base} → ${total}`,()=>assert.equal(scale(base).total,total));
test('Escala marginal, céntimos y exceso del último tramo',()=>{assert.equal(scale(0).total,0);assert.equal(scale(10000).total,2050);assert.equal(scale(300.5).total,126.18);assert.equal(scale(4000000).total,97580);});
test('Ordinario: criterio inferior antes del reparto por fases',()=>{const r=calculate({ruleId:'ordinary',base:1000,phase:'pleadings'});assert.equal(r.complete,2000);assert.equal(r.subtotal,1200);assert.equal(r.total,1452);});
test('Verbal, allanamiento y sesiones efectivas',()=>{assert.equal(calculate({ruleId:'verbal',base:1000,phase:'accept-defendant'}).subtotal,150);assert.equal(calculate({ruleId:'verbal',base:1000,sessions:2}).subtotal,800);});
test('Monitorio y posterior declarativo son actuaciones separadas',()=>{assert.equal(calculate({ruleId:'payment-no',base:10000}).subtotal,1025);assert.equal(calculate({ruleId:'payment-yes',base:10000}).subtotal,205);});
test('Apelación: usa honorarios de referencia, no escala de nuevo',()=>{assert.equal(calculate({ruleId:'appeal-ordinary',base:5000}).subtotal,2500);assert.equal(calculate({ruleId:'appeal-ordinary',base:1000}).subtotal,1000);});
test('Cuantía indeterminada, legislación especial e IVA editable',()=>{const r=calculate({ruleId:'ordinary',base:0,indeterminate:true,specialLaw:true,vat:0});assert.equal(r.total,3000);assert.equal(r.tax,0);});
test('Procedimiento fijo penal e IVA',()=>{const r=calculate({ruleId:'arrest',vat:21});assert.equal(r.subtotal,200);assert.equal(r.total,242);});
test('Rechaza entradas inválidas y ajustes incompatibles',()=>{for(const base of [-1,NaN,Infinity,1e13,'100'])assert.throws(()=>scale(base));assert.throws(()=>calculate({ruleId:'missing'}));assert.throws(()=>calculate({ruleId:'ordinary',base:100,vat:101}));assert.throws(()=>calculate({ruleId:'ordinary',base:100,sessions:1.5}));assert.throws(()=>calculate({ruleId:'arrest',indeterminate:true}));assert.throws(()=>calculate({ruleId:'payment-no',base:100,sessions:1}));assert.throws(()=>calculate({ruleId:'ordinary',phase:'wrong'}));});
test('Catálogo sin identificadores duplicados y cálculos finitos',()=>{assert.equal(new Set(RULES.map(r=>r.id)).size,RULES.length);for(const r of RULES)assert.ok(Number.isFinite(calculate({ruleId:r.id,base:10000}).total));});
