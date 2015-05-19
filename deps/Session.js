// Copyright (c) 2015 Jan Baykara. All rights reserved.
// Use of this source code is governed by the GNU GPL v2.0 license Session can be
// found in the LICENSE.md file.

// Utility chrome.sync() storage class
// TODO: Add array storage (for things like parsed URLs, msgIDs, settings, ignores)
// http://stackoverflow.com/questions/15717334/chrome-sync-storage-to-store-and-update-array
var Session = function(sessionProperties) {
    var Session = this

    Session.callbacks = {}

    /* ----
        Class methods
    */

    Session.set = function(property,value,cb) {
        var Session = this

        // set new value internally
        var oldVal = this[property]
        this[property] = value

        // set up object for chrome sync {k:v}
        var keyValue = {}
        keyValue[property] = value

        // sync
        chrome.storage.sync.set(
            keyValue,
            function sentToStorage() {
                console.log("SET Session."+property+" = "+value)
                if(typeof Session.callbacks[property] === 'function') Session.callbacks[property]("set",value,oldVal)
                if(typeof cb === 'function') cb(value)
            }
        )
        return this[property]
    }

    Session.get = function(property,cb) {
        var Session = this
        chrome.storage.sync.get(property, function receivedPropertyFromStorage(storage) {
            console.log("GET Session."+property+" = "+storage[property])
            Session[property] = storage[property]
            if(typeof Session.callbacks[property] === 'function') Session.callbacks[property]("get",Session[property])
            if(typeof cb === 'function') cb(Session[property])
        })
    }

    Session.after = function(callbackObj) {
        var Session = this
        _.merge(Session.callbacks, callbackObj)
    }

    /* ----
        Constructor
    */
    console.group("--- Loading chrome sync")
    _.each(sessionProperties, function(prop,i) {
        Session.get(prop)
        if(i >= sessionProperties.length - 1) {
            console.groupEnd()
        }
    })
}

/**
 * @license
 * lodash 3.8.0 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash include="each,merge"`
 */
;(function(){function t(t){return typeof t=="function"||false}function n(t){return typeof t=="string"?t:null==t?"":t+""}function r(t){return!!t&&typeof t=="object"}function e(){}function o(t,n){var r=-1,e=t.length;for(n||(n=Array(e));++r<e;)n[r]=t[r];return n}function u(t,n){for(var r=-1,e=t.length;++r<e&&n(t[r],r,t)!==false;);return t}function c(t,n,r){r||(r={});for(var e=-1,o=n.length;++e<o;){var u=n[e];r[u]=t[u]}return r}function a(t,n){return Vt(t,n,k)}function i(t,n){return Vt(t,n,Kt)}function f(t,n,e,o,c){
if(!S(t))return t;var a=v(n)&&(Gt(n)||I(n));if(!a){var i=Kt(n);kt.apply(i,qt(n))}return u(i||n,function(u,s){if(i&&(s=u,u=n[s]),r(u))o||(o=[]),c||(c=[]),l(t,n,s,f,e,o,c);else{var p=t[s],y=e?e(p,u,s,t,n):C,g=y===C;g&&(y=u),!a&&y===C||!g&&(y===y?y===p:p!==p)||(t[s]=y)}}),t}function l(t,n,r,e,u,c,a){for(var i=c.length,f=n[r];i--;)if(c[i]==f)return t[r]=a[i],C;var l=t[r],s=u?u(l,f,r,t,n):C,p=s===C;p&&(s=f,v(f)&&(Gt(f)||I(f))?s=Gt(l)?l:v(l)?o(l):[]:Jt(f)||x(f)?s=x(l)?F(l):Jt(l)?l:{}:p=false),c.push(f),a.push(s),
p?t[r]=e(s,f,u,c,a):(s===s?s!==l:l===l)&&(t[r]=s)}function s(t){return function(n){return null==n?C:E(n)[t]}}function p(t,n,r){if(typeof t!="function")return $;if(n===C)return t;switch(r){case 1:return function(r){return t.call(n,r)};case 3:return function(r,e,o){return t.call(n,r,e,o)};case 4:return function(r,e,o,u){return t.call(n,r,e,o,u)};case 5:return function(r,e,o,u,c){return t.call(n,r,e,o,u,c)}}return function(){return t.apply(n,arguments)}}function y(t){return w(function(n,r){var e=-1,o=null==n?0:r.length,u=o>2&&r[o-2],c=o>2&&r[2],a=o>1&&r[o-1];

for(typeof u=="function"?(u=p(u,a,5),o-=2):(u=typeof a=="function"?a:null,o-=u?1:0),c&&m(r[0],r[1],c)&&(u=o<3?null:u,o=1);++e<o;){var i=r[e];i&&t(n,i,u)}return n})}function g(t,n){return function(r,e){var o=r?Wt(r):0;if(!O(o))return t(r,e);for(var u=n?o:-1,c=E(r);(n?u--:++u<o)&&e(c[u],u,c)!==false;);return r}}function b(t){return function(n,r,e){for(var o=E(n),u=e(n),c=u.length,a=t?c:-1;t?a--:++a<c;){var i=u[a];if(r(o[i],i,o)===false)break}return n}}function h(t,n){return function(r,e,o){return typeof e=="function"&&o===C&&Gt(r)?t(r,e):n(r,p(e,o,3));

}}function v(t){return null!=t&&O(Wt(t))}function j(t,n){return t=+t,n=null==n?Nt:n,t>-1&&t%1==0&&t<n}function m(t,n,r){if(!S(r))return false;var e=typeof n;if("number"==e?v(r)&&j(n,r.length):"string"==e&&n in r){var o=r[n];return t===t?t===o:o!==o}return false}function O(t){return typeof t=="number"&&t>-1&&t%1==0&&t<=Nt}function A(t){var n,o=e.support;if(!r(t)||Pt.call(t)!=G||Ot(t)||!St.call(t,"constructor")&&(n=t.constructor,typeof n=="function"&&!(n instanceof n))||!o.argsTag&&x(t))return false;var u;return o.ownLast?(a(t,function(t,n,r){
return u=St.call(r,n),false}),u!==false):(a(t,function(t,n){u=n}),u===C||St.call(t,u))}function d(t){for(var n=k(t),r=n.length,o=r&&t.length,u=e.support,c=o&&O(o)&&(Gt(t)||u.nonEnumStrings&&T(t)||u.nonEnumArgs&&x(t)),a=-1,i=[];++a<r;){var f=n[a];(c&&j(f,o)||St.call(t,f))&&i.push(f)}return i}function E(t){if(e.support.unindexedChars&&T(t)){for(var n=-1,r=t.length,o=Object(t);++n<r;)o[n]=t.charAt(n);return o}return S(t)?t:Object(t)}function w(t,n){if(typeof t!="function")throw new TypeError(M);return n=Mt(n===C?t.length-1:+n||0,0),
function(){for(var r=arguments,e=-1,o=Mt(r.length-n,0),u=Array(o);++e<o;)u[e]=r[n+e];switch(n){case 0:return t.call(this,u);case 1:return t.call(this,r[0],u);case 2:return t.call(this,r[0],r[1],u)}var c=Array(n+1);for(e=-1;++e<n;)c[e]=r[e];return c[n]=u,t.apply(this,c)}}function x(t){return r(t)&&v(t)&&Pt.call(t)==N}function S(t){var n=typeof t;return"function"==n||!!t&&"object"==n}function P(t){return null==t?false:Pt.call(t)==W?Tt.test(xt.call(t)):r(t)&&(Ot(t)?Tt:ft).test(t)}function T(t){return typeof t=="string"||r(t)&&Pt.call(t)==K;

}function I(t){return r(t)&&O(t.length)&&!!st[Pt.call(t)]}function F(t){return c(t,k(t))}function k(t){if(null==t)return[];S(t)||(t=Object(t));var n=t.length,r=e.support;n=n&&O(n)&&(Gt(t)||r.nonEnumStrings&&T(t)||r.nonEnumArgs&&x(t))&&n||0;for(var o=t.constructor,u=-1,c=Ht(o)&&o.prototype||Et,a=c===t,i=Array(n),f=n>0,l=r.enumErrorProps&&(t===dt||t instanceof Error),s=r.enumPrototypes&&Ht(t);++u<n;)i[u]=u+"";for(var p in t)s&&"prototype"==p||l&&("message"==p||"name"==p)||f&&j(p,n)||"constructor"==p&&(a||!St.call(t,p))||i.push(p);

if(r.nonEnumShadows&&t!==Et){var y=t===wt?K:t===dt?V:Pt.call(t),g=_t[y]||_t[G];for(y==G&&(c=Et),n=lt.length;n--;){p=lt[n];var b=g[p];a&&b||(b?!St.call(t,p):t[p]===c[p])||i.push(p)}}return i}function R(t){return t=n(t),t&&it.test(t)?t.replace(at,"\\$&"):t}function U(t){return function(){return t}}function $(t){return t}var C,L="3.8.0",M="Expected a function",N="[object Arguments]",_="[object Array]",B="[object Boolean]",D="[object Date]",V="[object Error]",W="[object Function]",q="[object Map]",z="[object Number]",G="[object Object]",H="[object RegExp]",J="[object Set]",K="[object String]",Q="[object WeakMap]",X="[object ArrayBuffer]",Y="[object Float32Array]",Z="[object Float64Array]",tt="[object Int8Array]",nt="[object Int16Array]",rt="[object Int32Array]",et="[object Uint8Array]",ot="[object Uint8ClampedArray]",ut="[object Uint16Array]",ct="[object Uint32Array]",at=/[.*+?^${}()|[\]\/\\]/g,it=RegExp(at.source),ft=/^\[object .+?Constructor\]$/,lt=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],st={};

st[Y]=st[Z]=st[tt]=st[nt]=st[rt]=st[et]=st[ot]=st[ut]=st[ct]=true,st[N]=st[_]=st[X]=st[B]=st[D]=st[V]=st[W]=st[q]=st[z]=st[G]=st[H]=st[J]=st[K]=st[Q]=false;var pt={"function":true,object:true},yt=pt[typeof exports]&&exports&&!exports.nodeType&&exports,gt=pt[typeof module]&&module&&!module.nodeType&&module,bt=yt&&gt&&typeof global=="object"&&global&&global.Object&&global,ht=pt[typeof self]&&self&&self.Object&&self,vt=pt[typeof window]&&window&&window.Object&&window,jt=gt&&gt.exports===yt&&yt,mt=bt||vt!==(this&&this.window)&&vt||ht||this,Ot=function(){
try{Object({toString:0}+"")}catch(t){return function(){return false}}return function(t){return typeof t.toString!="function"&&typeof(t+"")=="string"}}(),At=Array.prototype,dt=Error.prototype,Et=Object.prototype,wt=String.prototype,xt=Function.prototype.toString,St=Et.hasOwnProperty,Pt=Et.toString,Tt=RegExp("^"+R(Pt).replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),It=P(It=Object.getOwnPropertySymbols)&&It,Ft=P(Ft=Object.getPrototypeOf)&&Ft,kt=At.push,Rt=Et.propertyIsEnumerable,Ut=At.splice,$t=P($t=mt.Uint8Array)&&$t,Ct=P(Ct=Array.isArray)&&Ct,Lt=P(Lt=Object.keys)&&Lt,Mt=Math.max,Nt=Math.pow(2,53)-1,_t={};

_t[_]=_t[D]=_t[z]={constructor:true,toLocaleString:true,toString:true,valueOf:true},_t[B]=_t[K]={constructor:true,toString:true,valueOf:true},_t[V]=_t[W]=_t[H]={constructor:true,toString:true},_t[G]={constructor:true},u(lt,function(t){for(var n in _t)if(St.call(_t,n)){var r=_t[n];r[t]=St.call(r,t)}});var Bt=e.support={};!function(t){var n=function(){this.x=t},r=arguments,e={0:t,length:t},o=[];n.prototype={valueOf:t,y:t};for(var u in new n)o.push(u);Bt.argsTag=Pt.call(r)==N,Bt.enumErrorProps=Rt.call(dt,"message")||Rt.call(dt,"name"),
Bt.enumPrototypes=Rt.call(n,"prototype"),Bt.funcDecomp=/\bthis\b/.test(function(){return this}),Bt.funcNames=typeof Function.name=="string",Bt.nonEnumStrings=!Rt.call("x",0),Bt.nonEnumShadows=!/valueOf/.test(o),Bt.ownLast="x"!=o[0],Bt.spliceObjects=(Ut.call(e,0,1),!e[0]),Bt.unindexedChars="x"[0]+Object("x")[0]!="xx";try{Bt.nonEnumArgs=!Rt.call(r,1)}catch(c){Bt.nonEnumArgs=true}}(1,0);var Dt=g(i),Vt=b(),Wt=s("length"),qt=It?function(t){return It(E(t))}:U([]),zt=h(u,Dt);Bt.argsTag||(x=function(t){return r(t)&&v(t)&&St.call(t,"callee")&&!Rt.call(t,"callee");

});var Gt=Ct||function(t){return r(t)&&O(t.length)&&Pt.call(t)==_},Ht=t(/x/)||$t&&!t($t)?function(t){return Pt.call(t)==W}:t,Jt=Ft?function(t){if(!t||Pt.call(t)!=G||!e.support.argsTag&&x(t))return false;var n=t.valueOf,r=P(n)&&(r=Ft(n))&&Ft(r);return r?t==r||Ft(t)==r:A(t)}:A,Kt=Lt?function(t){var n=null!=t&&t.constructor;return typeof n=="function"&&n.prototype===t||(typeof t=="function"?e.support.enumPrototypes:v(t))?d(t):S(t)?Lt(t):[]}:d,Qt=y(f);e.constant=U,e.forEach=zt,e.keys=Kt,e.keysIn=k,e.merge=Qt,
e.restParam=w,e.toPlainObject=F,e.each=zt,e.escapeRegExp=R,e.identity=$,e.isArguments=x,e.isArray=Gt,e.isFunction=Ht,e.isNative=P,e.isObject=S,e.isPlainObject=Jt,e.isString=T,e.isTypedArray=I,e.VERSION=L,typeof define=="function"&&typeof define.amd=="object"&&define.amd?(mt._=e, define(function(){return e})):yt&&gt?jt?(gt.exports=e)._=e:yt._=e:mt._=e}).call(this);