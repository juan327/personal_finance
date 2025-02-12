import{a as se,b as j,c as pe,d as de}from"./chunk-K2QSAUHK.js";import{a as U,b as xe,c as J,d as K}from"./chunk-G6VEXFTW.js";import{a as Y,b as C,c as Z,d as ee,f as te,g as ne,h as ie,l as oe,m as ae,n as re,o as le,p as ce,q as me}from"./chunk-ND2E57TF.js";import{a as Q,b as N,c as k}from"./chunk-7A5JR2EX.js";import{$a as P,Ba as A,Ea as W,Ja as E,Nb as R,Ob as H,P as $,Pb as B,Qa as M,Ta as F,Ub as I,V as T,Vb as X,Xa as a,Ya as o,Za as h,ab as b,ba as u,bb as g,ca as f,d as Ce,e as x,gb as l,hb as S,ib as v,jb as L,ob as z,qb as w,rb as D,sb as O,va as p}from"./chunk-JE4FXYSB.js";var _e=Ce(xe());var V=class r{constructor(){}_indexeddbService=T(X);_highchartService=T(J);_genericService=T(I);_fb=T(ae);_categoryType=2;loadCategories(){return x(this,null,function*(){var n=new k;try{yield this._indexeddbService.getAllItems("categories","name","desc").then(e=>{n.data=e.items.filter(t=>t.type===this._categoryType),n.confirmation=!0,n.message="Categor\xEDas cargadas correctamente"},e=>{console.error(e),n.message=e.message,n.exception=e.toString()})}catch(e){console.error(e),n.message=e.message,n.exception=e.toString()}return n})}loadTable(n,e,t,i,s){return x(this,null,function*(){var d=new k;try{yield this._indexeddbService.getAllItems("transactions","created","desc").then(c=>{if(c.total>0){let y=n.search.trim().toLowerCase();e=c.items.filter(_=>_.category.type===this._categoryType&&(_.name.toLowerCase().includes(y)||_.description.toLowerCase().includes(y)||_.category.name.toLowerCase().includes(y))).map(_=>({transactionId:_.transactionId,name:_.name,amount:_.amount,amountString:this._genericService.convertToCurrencyFormat(_.amount).data,date:_.date,description:_.description,categoryId:_.categoryId,categoryName:_.category.name,categoryType:_.category.type,created:_.created})),n.total=e.length}let m=this.getChartOptions(e,t,i);m.confirmation?e.length>1&&s!==null?this._highchartService.updateChart(s,m.data):s=this._highchartService.buildChart("container",m.data):(d.message=m.message,d.exception=m.exception),d.data={partialTableOptions:n,transactions:e,categories:t,chart:s},d.confirmation=!0,d.message="Tabla cargada correctamente"},c=>{console.error(c),d.message=c.message,d.exception=c.toString()})}catch(c){console.error(c),d.message=c.message,d.exception=c.toString()}return d})}modalOpen(n,e=null){var t=new k;try{e!==null?t.data=this._fb.group({opc:["Edit"],opcLabel:["Editar"],transactionId:[e.transactionId,[C.required]],name:[e.name,[C.required,C.minLength(3)]],amount:[e.amount.toString(),[C.required,j(2)]],date:[e.date,[C.required]],categoryId:[e.categoryId,[C.required]],description:[e.description]}):t.data=this._fb.group({opc:["Create"],opcLabel:["Crear"],name:["",[C.required,C.minLength(3)]],amount:["0",[C.required,j(2)]],date:[this._genericService.getDateTimeNow(),[C.required]],categoryId:[n[0].categoryId,[C.required]],description:[""]}),t.confirmation=!0,t.message="Modal abierto correctamente"}catch(i){console.error(i),t.message=i.message,t.exception=i.toString()}return t}createOrUpdate(n,e){return x(this,null,function*(){var t=new N;try{let i=n.value,s=this._genericService.parseNumber(i.amount.replace(".",""));if(!s.confirmation)return t.message=s.message,t.exception=s.exception,t;let d=e.find(c=>c.categoryId===i.categoryId&&c.type===this._categoryType);if(d===void 0)return t.message="No se encontr\xF3 la categor\xEDa",t;if(i.opc==="Edit")yield this._indexeddbService.getItem("transactions",i.transactionId).then(c=>x(this,null,function*(){c.name=i.name,c.amount=s.data,c.date=new Date(i.date),c.description=i.description,c.categoryId=i.categoryId,c.category=d,yield this._indexeddbService.updateItem("transactions",c.transactionId,c).then(m=>{t.confirmation=!0,t.message="Transacci\xF3n actualizada correctamente"},m=>{console.error(m),t.message=m.message,t.exception=m.toString()})}),c=>{console.error(c),t.message=c.message,t.exception=c.toString()});else{let c={transactionId:this._genericService.generateGuid(),name:i.name,amount:s.data,date:new Date(i.date),description:i.description,categoryId:i.categoryId,category:d,created:this._genericService.getDateTimeNow()};yield this._indexeddbService.addItem("transactions",c).then(m=>{t.confirmation=!0,t.message="Transacci\xF3n creada correctamente"},m=>{console.error(m),t.message=m.message,t.exception=m.toString()})}}catch(i){console.error(i),t.message=i.message,t.exception=i.toString()}return t})}delete(n){return x(this,null,function*(){var e=new N;try{yield this._indexeddbService.deleteItem("transactions",n).then(t=>{e.confirmation=!0,e.message="Transacci\xF3n eliminada correctamente"},t=>{console.error(t),e.message=t.message,e.exception=t.toString()})}catch(t){console.error(t),e.message=t.message,e.exception=t.toString()}return e})}getChartOptions(n,e,t){var i=new k;try{let s=[],d=n.reduce((c,m)=>c+m.amount,0);for(let c=0;c<e.length;c++){let m=e[c],y=n.reduce((fe,q)=>fe+(q.categoryId===m.categoryId?q.amount:0),0),_=this._genericService.convertToCurrencyFormat(y).data,G=d>0?y*100/d:0,ue=this._genericService.parseNumber(G.toFixed(2)).data;s.push({id:m.categoryId,name:`${m.name} (${t.currency} ${_})`,y:ue,selected:!1,sliced:!1})}if(s.length>0){let c=s.reduce((m,y)=>m.y>y.y?m:y);c.name=`<b style="color: var(--color-green); font-size: 0.9rem;">${c.name}</b>`}i.data={title:{text:"Distribuci\xF3n de ingresos"},subtitle:{text:n.length>0?"":"Sin datos"},tooltip:{valueSuffix:"%"},series:n.length>0?[{type:"pie",name:"Porcentaje",showInLegend:!0,data:s}]:[]},i.confirmation=!0,i.message="Opciones del gr\xE1fico cargadas correctamente"}catch(s){console.error(s),i.message=s.message,i.exception=s.toString()}return i}static \u0275fac=function(e){return new(e||r)};static \u0275prov=$({token:r,factory:r.\u0275fac,providedIn:"root"})};function Oe(r,n){if(r&1){let e=P();a(0,"div",9)(1,"h2"),l(2,"Historial"),o(),a(3,"button",10),b("click",function(){u(e);let i=g();return f(i.onOpenModal())}),l(4,"Agregar gasto"),o(),a(5,"input",11),b("input",function(i){u(e);let s=g();return f(s.search(i))}),o()()}}function he(r,n){r&1&&(a(0,"tr")(1,"th"),l(2,"Categor\xEDa"),o(),a(3,"th"),l(4,"Nombre"),o(),a(5,"th"),l(6,"Monto"),o(),a(7,"th"),l(8,"Fecha"),o(),a(9,"th"),l(10,"Creaci\xF3n"),o(),a(11,"th"),l(12,"OPC"),o()())}function ye(r,n){if(r&1){let e=P();a(0,"tr")(1,"td"),l(2),o(),a(3,"td"),l(4),o(),a(5,"td"),l(6),o(),a(7,"td"),l(8),w(9,"date"),o(),a(10,"td"),l(11),w(12,"date"),o(),a(13,"td")(14,"div",12)(15,"button",13),b("click",function(){let i=u(e).$implicit,s=g();return f(s.onOpenModal(i))}),h(16,"i",14),o(),a(17,"button",15),b("click",function(){let i=u(e).$implicit,s=g();return f(s.onModalOpenDelete(i))}),h(18,"i",16),o()()()()}if(r&2){let e=n.$implicit,t=g();p(2),S(e.categoryName),p(2),S(e.name),p(2),L(" ",t._localStorage.currency," ",e.amountString," "),p(2),S(D(9,6,e.date,"dd/MM/yyyy hh:mm a")),p(3),S(D(12,9,e.created,"dd/MM/yyyy hh:mm a"))}}function Te(r,n){if(r&1){let e=P();a(0,"ul")(1,"li")(2,"strong"),l(3,"Categor\xEDa:"),o(),l(4),o(),a(5,"li")(6,"strong"),l(7,"Nombre:"),o(),l(8),o(),a(9,"li")(10,"strong"),l(11,"Monto:"),o(),l(12),o(),a(13,"li")(14,"strong"),l(15,"Fecha:"),o(),l(16),w(17,"date"),o(),a(18,"li")(19,"strong"),l(20,"Creaci\xF3n:"),o(),l(21),w(22,"date"),o(),a(23,"li")(24,"strong"),l(25,"OPC:"),o(),a(26,"div",12)(27,"button",13),b("click",function(){let i=u(e).$implicit,s=g();return f(s.onOpenModal(i))}),h(28,"i",14),o(),a(29,"button",15),b("click",function(){let i=u(e).$implicit,s=g();return f(s.onModalOpenDelete(i))}),h(30,"i",16),o()()()()}if(r&2){let e=n.$implicit,t=g();p(4),v(" ",e.categoryName,""),p(4),v(" ",e.name,""),p(4),L(" ",t._localStorage.currency," ",e.amountString,""),p(4),v(" ",D(17,6,e.date,"dd/MM/yyyy hh:mm a"),""),p(5),v(" ",D(22,9,e.created,"dd/MM/yyyy hh:mm a"),"")}}function ve(r,n){if(r&1&&(a(0,"h2"),l(1),o()),r&2){let e,t=g(2);p(),v("",(e=t._form.get("opcLabel"))==null?null:e.value," gasto")}}function Me(r,n){if(r&1&&l(0),r&2){let e=n.$implicit;v(" ",e.name," ")}}function Pe(r,n){if(r&1&&(a(0,"div",19)(1,"div",20)(2,"label",21),l(3,"Nombre"),o(),h(4,"input",22),o(),a(5,"div",20)(6,"label",23),l(7,"Cantidad"),o(),h(8,"partial-inputnumber",24),o(),a(9,"div",20)(10,"label",25),l(11,"Fecha"),o(),h(12,"partial-inputdatetime",26),o(),a(13,"div",20)(14,"label",27),l(15,"Categor\xEDa"),o(),a(16,"partial-select",28),E(17,Me,1,1,"ng-template",null,2,O),o()(),a(19,"div",20)(20,"label",29),l(21,"Descripci\xF3n"),o(),h(22,"textarea",30),o()()),r&2){let e=g(2);p(8),M("_form",e._form),p(4),M("_form",e._form),p(4),M("_options",e._categories)("_form",e._form)}}function Se(r,n){if(r&1&&(a(0,"div",31)(1,"button",32),l(2),o()()),r&2){let e,t=g(2);p(),M("disabled",t._form.invalid),p(),S((e=t._form.get("opcLabel"))==null?null:e.value)}}function Ee(r,n){if(r&1){let e=P();a(0,"form",17),b("ngSubmit",function(){u(e);let i=g();return f(i.onSubmitForm(i._form))}),a(1,"partial-modal",18),b("eventCloseModal",function(){u(e);let i=g();return f(i.onCloseModal())}),E(2,ve,2,1,"ng-template",null,1,O)(4,Pe,23,4,"ng-template",null,2,O)(6,Se,3,2,"ng-template",null,4,O),o()()}if(r&2){let e=g();M("formGroup",e._form)}}function we(r,n){r&1&&(a(0,"h2"),l(1,"Eliminar gasto"),o())}function De(r,n){if(r&1&&(a(0,"h4"),l(1,"\xBFEst\xE1 seguro de que desea eliminar el gasto "),a(2,"b"),l(3),o(),l(4,"?"),o()),r&2){let e=g(2);p(3),S(e._selectedTransaction.name)}}function Ie(r,n){if(r&1){let e=P();a(0,"partial-modalconfirmation",33),b("eventOnSuccess",function(){u(e);let i=g();return f(i.onDelete(i._selectedTransaction))})("eventOnCancel",function(){u(e);let i=g();return i._modals.deleteTransaction=!1,f(i._selectedTransaction=null)}),E(1,we,2,0,"ng-template",null,1,O)(3,De,5,1,"ng-template",null,2,O),o()}}_e.setOptions(K);var ge=class r{constructor(){}_genericService=T(I);_expensesService=T(V);_form=null;_transactions=[];_selectedTransaction=null;_categories=[];_chart=null;_modals={transaction:!1,deleteTransaction:!1};_partialTableOptions={search:"",skip:0,take:5,total:0};_localStorage={currency:this._genericService.getLocalStorage("currency")||"$",language:this._genericService.getLocalStorage("language")||"es"};_totalAmountSignal=A("-");ngOnInit(){this.loadCategories()}ngAfterViewInit(){}ngOnDestroy(){}loadCategories(){return x(this,null,function*(){let n=yield this._expensesService.loadCategories();n.confirmation&&(this._categories=n.data,yield this.loadTable())})}loadTable(){return x(this,null,function*(){let n=yield this._expensesService.loadTable(this._partialTableOptions,this._transactions,this._categories,this._localStorage,this._chart);n.confirmation&&(this._partialTableOptions=n.data.partialTableOptions,this._transactions=n.data.transactions,this._categories=n.data.categories,this._chart=n.data.chart,this.loadTotalAmount())})}onOpenModal(n=null){var e=this._expensesService.modalOpen(this._categories,n);if(!e.confirmation){alert(e.message);return}this._form=e.data,this._selectedTransaction=n,this._modals.transaction=!0}onCloseModal(){this._modals.transaction=!1,this._form=null}onSubmitForm(n){return x(this,null,function*(){var e=yield this._expensesService.createOrUpdate(n,this._categories);if(!e.confirmation){alert(e.message);return}this._modals.transaction=!1,this.loadTable()})}onModalOpenDelete(n){this._selectedTransaction=n,this._modals.deleteTransaction=!0}onDelete(n){return x(this,null,function*(){let e=yield this._expensesService.delete(n.transactionId);if(!e.confirmation){alert(e.message);return}this._modals.deleteTransaction=!1,this.loadTable()})}loadTotalAmount(){let n=this._genericService.convertToCurrencyFormat(this._transactions.reduce((e,t)=>e+t.amount,0));n.confirmation&&this._totalAmountSignal.set(`${this._localStorage.currency} ${n.data}`)}onLoadPartialTable(n){this._partialTableOptions=n}onChangePartialTable(n){this._partialTableOptions=n,this.loadTable()}search(n){this._partialTableOptions.search=n.target.value,this.loadTable()}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=W({type:r,selectors:[["app-expenses"]],features:[z([V,I,R,H])],decls:16,vars:5,consts:[["caption",""],["header",""],["body",""],["bodyMobile",""],["footer",""],[1,"card"],[3,"eventOnLoad","eventOnChange","_values","_options"],["id","container"],[3,"formGroup"],[1,"caption"],["type","button",1,"btn","success",3,"click"],["type","text","placeholder","Busqueda rapida...",3,"input"],[1,"operations"],["type","button","title","Editar",1,"btn","primary",3,"click"],[1,"pi","pi-pen-to-square"],["type","button","title","Eliminar",1,"btn","danger",3,"click"],[1,"pi","pi-trash"],[3,"ngSubmit","formGroup"],[3,"eventCloseModal"],[1,"form"],[1,"form-group"],["for","name"],["type","text","formControlName","name","id","name","name","name","autocomplete","off","required",""],["for","amount"],["_id","amount","_formControlName","amount","_autocomplete","off",3,"_form"],["for","date"],["_formControlName","date","_autocomplete","off",3,"_form"],["for","category"],["_formControlName","categoryId","_label","name","_value","categoryId",3,"_options","_form"],["for","description"],["formControlName","description","id","description","name","description","autocomplete","off"],[1,"footer"],["type","submit",1,"btn","success",3,"disabled"],[3,"eventOnSuccess","eventOnCancel"]],template:function(e,t){if(e&1){let i=P();a(0,"section")(1,"div",5)(2,"partial-table",6),b("eventOnLoad",function(d){return u(i),f(t.onLoadPartialTable(d))})("eventOnChange",function(d){return u(i),f(t.onChangePartialTable(d))}),E(3,Oe,6,0,"ng-template",null,0,O)(5,he,13,0,"ng-template",null,1,O)(7,ye,19,12,"ng-template",null,2,O)(9,Te,31,12,"ng-template",null,3,O),o(),l(11),o(),a(12,"div",5),h(13,"div",7),o()(),E(14,Ee,8,1,"form",8)(15,Ie,5,0,"partial-modalconfirmation")}e&2&&(p(2),M("_values",t._transactions)("_options",t._partialTableOptions),p(9),v(" TOTAL: ",t._totalAmountSignal()," "),p(3),F(t._modals.transaction&&t._form!==null?14:-1),p(),F(t._modals.deleteTransaction&&t._selectedTransaction!==null?15:-1))},dependencies:[B,R,re,te,Y,Z,ee,oe,U,le,ne,ie,ce,se,Q,me,pe,de],styles:["partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]{width:100%;display:grid;gap:10px;view-transition-name:partial-table}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]{overflow:auto;max-height:400px}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   table.partial-table[_ngcontent-%COMP%]{background-color:var(--color-black);border:1px solid var(--color-black-border);min-width:100%;border-spacing:0;border-collapse:collapse;position:relative}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   table.partial-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]{background-color:var(--color-black);position:sticky;top:-1px}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   table.partial-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{padding:10px;text-align:left;word-break:break-word;overflow-wrap:break-word}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   table.partial-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(odd){background-color:var(--color-black-weight)}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   table.partial-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:10px;text-align:left;word-break:break-word;overflow-wrap:break-word}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   .partial-table-mobile[_ngcontent-%COMP%]{display:none;flex-direction:column;gap:10px}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   .partial-table-mobile[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]{padding:10px;display:flex;flex-direction:column;gap:10px}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   .partial-table-mobile[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]:nth-child(odd){background-color:var(--color-black-weight)}partial-table[_ngcontent-%COMP%]   .container[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%]   .partial-table-mobile[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{display:flex;gap:10px}section[_ngcontent-%COMP%]{container-type:inline-size;display:flex;flex-direction:column;gap:20px}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:20px;gap:5px;border-radius:10px;background-color:var(--color-black);border:1px solid var(--color-black-border);transition:padding .3s ease}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]{container-type:inline-size}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   .caption[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr repeat(2,auto);align-items:center;gap:10px}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{font-size:1.2rem}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   span.title[_ngcontent-%COMP%]{font-size:1.3rem}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   span.comment[_ngcontent-%COMP%]{font-size:.8rem;color:var(--color-black-text)}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   .operations[_ngcontent-%COMP%]{display:flex;gap:5px;align-items:center;justify-content:center;font-size:1px}section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   .operations[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{padding:5px 10px;font-size:.8rem!important}@container (width <= 600px){section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   partial-table[_ngcontent-%COMP%]   .caption[_ngcontent-%COMP%]{grid-template-columns:1fr}}@container (width <= 600px){section[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]{padding:10px!important}}form[_ngcontent-%COMP%]   .form[_ngcontent-%COMP%], form[_ngcontent-%COMP%]   .form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:10px}form[_ngcontent-%COMP%]   .form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:1.1rem}form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]{display:flex;justify-content:flex-end}"]})};export{ge as ExpensesComponent};
