var Alerts=function(k){var e=div({id:"alerts"}),d=[],h=function(){this.parentNode.remove()},g=function(c,a,b,f){c={type:c,category:a,title:b,text:f};a:{for(a=0;a<d.length;a++)if(b=d[a],b.category===c.category&&b.type===c.type)break a;a=-1}0<=a&&d.splice(a,1);d.push(c);H.empty(e);for(c=0;c<d.length;c++)a=d[c],b=null,"alert"===a.type?b=icon("info"):"error"===a.type&&(b=icon("warning")),b=div({cls:"header"},b,a.title),f=span({cls:"close",onclick:h},icon("clear")),a=div({cls:"box "+a.type},b,a.text,f),
e.appendChild(a)};this.addAlert=function(c,a,b){g("alert",c,a,b)};this.addError=function(c,a,b){g("error",c,a,b)};this.clear=function(){H.empty(e)};this.render=function(){return e}};