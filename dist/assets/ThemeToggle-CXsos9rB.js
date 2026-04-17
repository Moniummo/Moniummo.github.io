import{r as o,b as v,j as h,c as M}from"./index-DD7NfrqK.js";import{c as x}from"./utils-BZGAeGAJ.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),g=(...t)=>t.filter((e,r,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===r).join(" ").trim();/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var j={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=o.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:s="",children:n,iconNode:i,...l},d)=>o.createElement("svg",{ref:d,...j,width:e,height:e,stroke:t,strokeWidth:a?Number(r)*24/Number(e):r,className:g("lucide",s),...l},[...i.map(([u,m])=>o.createElement(u,m)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=(t,e)=>{const r=o.forwardRef(({className:a,...s},n)=>o.createElement(_,{ref:n,iconNode:e,className:g(`lucide-${E(t)}`,a),...s}));return r.displayName=`${t}`,r};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=b("MoonStar",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9",key:"4ay0iu"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=b("SunMedium",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 3v1",key:"1asbbs"}],["path",{d:"M12 20v1",key:"1wcdkc"}],["path",{d:"M3 12h1",key:"lp3yf2"}],["path",{d:"M20 12h1",key:"1vloll"}],["path",{d:"m18.364 5.636-.707.707",key:"1hakh0"}],["path",{d:"m6.343 17.657-.707.707",key:"18m9nf"}],["path",{d:"m5.636 5.636.707.707",key:"1xv1c5"}],["path",{d:"m17.657 17.657.707.707",key:"vl76zb"}]]),L=({className:t})=>{const[e,r]=o.useState(!1),{resolvedTheme:a,setTheme:s}=v(),n=o.useRef(null);o.useEffect(()=>{r(!0)},[]);const i=e&&a==="dark",l=async()=>{var y;const d=i?"light":"dark",u=window.matchMedia("(prefers-reduced-motion: reduce)").matches,m=document;if(!e||u||!m.startViewTransition){s(d);return}const c=(y=n.current)==null?void 0:y.getBoundingClientRect(),p=c?c.left+c.width/2:window.innerWidth/2,w=c?c.top+c.height/2:window.innerHeight/2,f=Math.hypot(Math.max(p,window.innerWidth-p),Math.max(w,window.innerHeight-w));document.documentElement.style.setProperty("--theme-transition-x",`${p}px`),document.documentElement.style.setProperty("--theme-transition-y",`${w}px`),document.documentElement.style.setProperty("--theme-transition-radius",`${f}px`),document.documentElement.style.setProperty("--theme-transition-glow",d==="dark"?"rgba(176, 136, 255, 0.84)":"rgba(228, 185, 84, 0.82)"),document.documentElement.classList.add("theme-transition-active");const k=m.startViewTransition(()=>{M.flushSync(()=>{s(d)})});try{await k.finished}catch{s(d)}finally{document.documentElement.classList.remove("theme-transition-active")}};return h.jsxs("button",{ref:n,type:"button",onClick:()=>{l()},"aria-label":`Switch to ${i?"light":"dark"} mode`,className:x("relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/18 bg-white/10 px-4 py-2.5 font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground shadow-[0_18px_42px_rgba(173,133,37,0.10)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/16 hover:text-primary dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_18px_46px_rgba(8,5,18,0.55)] dark:hover:bg-white/[0.08]",t),children:[h.jsx("span",{className:"pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent opacity-90"}),h.jsx("span",{className:x("flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-colors duration-300 dark:border-white/10",i?"bg-primary/18":"bg-white/46"),children:i?h.jsx(R,{className:"h-4 w-4"}):h.jsx(C,{className:"h-4 w-4"})}),h.jsx("span",{children:i?"Dark Mode":"Light Mode"})]})};export{L as default};
