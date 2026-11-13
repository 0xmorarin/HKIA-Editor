class E {
 constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.attrs=new Map();this.children=[];this.content='';this.parentElement=null;}
 get attributes(){return [...this.attrs].map(([name,value])=>({name,value}));}
 get childNodes(){return [...(this.content?[{nodeType:3,textContent:this.content}]:[]),...this.children];}
 get textContent(){return this.content+this.children.map(n=>n.textContent).join('');}
 set textContent(v){this.replaceChildren();this.content=String(v);}
 get id(){return this.attrs.get('id')??'';}set id(v){this.attrs.set('id',v);}
 get className(){return this.attrs.get('class')??'';}set className(v){this.attrs.set('class',v);}
 hasAttribute(k){return this.attrs.has(k);}setAttribute(k,v){this.attrs.set(k,String(v));}removeAttribute(k){this.attrs.delete(k);}
 append(...xs){for(const n of xs){if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(x=>x!==n);n.parentElement=this;this.children.push(n);}}
 replaceChildren(...xs){for(const n of this.children)n.parentElement=null;this.children=[];this.content='';this.append(...xs);}
 cloneNode(deep){const n=new E(this.tagName,this.doc);n.attrs=new Map(this.attrs);n.content=this.content;if(deep)n.append(...this.children.map(x=>x.cloneNode(true)));return n;}
}
export function make(){
 const doc={createElement(t){return new E(t,this);},querySelectorAll(){return this.panels;},getElementById(){return this.panels[0]??null;}};
 const panel=doc.createElement('aside');panel.id='editorPanel';doc.panels=[panel];
 return {doc,panel};
}
export function paint(host,h){
 const n=(t,c,v)=>{const e=host.doc.createElement(t);if(c)e.className=c;if(v!==undefined)e.textContent=v;return e;};
 host.append(n('h4','',h.title));
 if(h.empty!==null)host.append(n('p','',h.empty));
 else for(const l of h.lines){const e=n('div','detail-line');e.append(n('b','',l.label),n('span','',l.value));host.append(e);}
}
export const sample=(guid='fixture-a',current='9007199254740993')=>({guid,title:'Fixture '+guid,empty:null,lines:[{label:'GUID',value:guid},{label:'定義照合',value:'照合済み'},{label:'状態',value:'達成済み'},{label:'進捗',value:current},{label:'達成日時',value:'2026-01-01T00:00:00.1234567Z'}]});

