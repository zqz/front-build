var UploaderSettingsComponent=function(b){var a=b.settings,d=function(a,b,d){var c=b,f=function(){c?e.classList.add("active"):e.classList.remove("active")},e=div({cls:"checkbox",onclick:function(){c=!c;d(c);f()}});a=span({cls:"checkbox-container"},a,e);f();return a};b=d("Instant Upload",a.instant(),a.setInstant);var a=d("Redirect",a.redirect(),a.setRedirect),g=div({cls:"settings right"},b,a);return{render:function(){return g}}};