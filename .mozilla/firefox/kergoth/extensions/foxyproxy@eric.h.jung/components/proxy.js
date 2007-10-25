
var CI=Components.interfaces,CC=Components.classes,CR=Components.results;var fp=null;var proxyService=CC["@mozilla.org/network/protocol-proxy-service;1"].getService(CI.nsIProtocolProxyService);function gQueryInterface(aIID){if(!aIID.equals(CI.nsISupports)&&!aIID.equals(CI.nsISupportsWeakReference))
throw CR.NS_ERROR_NO_INTERFACE;return this;}
function Proxy(){this.wrappedJSObject=this;!fp&&(fp=CC["@leahscape.org/foxyproxy/service;1"].getService(CI.nsISupports).wrappedJSObject);this.matches=new Array();this.name=this.notes="";this.manualconf=new ManualConf();this.autoconf=new AutoConf(this,null);this.mode="manual";this.enabled=true;this.selectedTabIndex=0;this.lastresort=false;this.id=fp.proxies.uniqueRandom();}
Proxy.prototype={QueryInterface:gQueryInterface,direct:proxyService.newProxyInfo("direct","",-1,0,0,null),animatedIcons:true,includeInCycle:true,__registration:function(){return({topics:null,observerName:null,contractId:"@leahscape.org/foxyproxy/proxy;1",classId:Components.ID("{51b469a0-edc1-11da-8ad9-0800200c9a66}"),constructor:Proxy,className:"FoxyProxy Proxy Component"});},fromDOM:function(node){this.name=node.getAttribute("name");this.id=node.getAttribute("id")||fp.proxies.uniqueRandom();this.notes=node.getAttribute("notes");this.enabled=node.getAttribute("enabled")=="true";this.autoconf.fromDOM(node.getElementsByTagName("autoconf")[0]);this.manualconf.fromDOM(node.getElementsByTagName("manualconf")[0]);this.mode=node.hasAttribute("manual")?(node.getAttribute("manual")=="true"?"manual":"auto"):node.getAttribute("mode");this.selectedTabIndex=node.getAttribute("selectedTabIndex")||"0";this.lastresort=node.hasAttribute("lastresort")?node.getAttribute("lastresort")=="true":false;this.animatedIcons=node.hasAttribute("animatedIcons")?node.getAttribute("animatedIcons")=="true":!this.lastresort;this.includeInCycle=node.hasAttribute("includeInCycle")?node.getAttribute("includeInCycle")=="true":!this.lastresort;for(var i=0,temp=node.getElementsByTagName("match");i<temp.length;i++){var j=this.matches.length;this.matches[j]=new Match();this.matches[j].fromDOM(temp[i]);}
this.afterPropertiesSet();},toDOM:function(doc){var e=doc.createElement("proxy");e.setAttribute("name",this.name);e.setAttribute("id",this.id);e.setAttribute("notes",this.notes);e.setAttribute("enabled",this.enabled);e.setAttribute("mode",this.mode);e.setAttribute("selectedTabIndex",this.selectedTabIndex);e.setAttribute("lastresort",this.lastresort);e.setAttribute("animatedIcons",this.animatedIcons);e.setAttribute("includeInCycle",this.includeInCycle);var matchesElem=doc.createElement("matches");e.appendChild(matchesElem);for(var j=0;j<this.matches.length;j++){matchesElem.appendChild(this.matches[j].toDOM(doc));}
e.appendChild(this.autoconf.toDOM(doc));e.appendChild(this.manualconf.toDOM(doc));return e;},set enabled(e){if(this.lastresort&&!e)return;this._enabled=e;this._enabled&&this._mode=="auto"&&this.autoconf.loadPAC();this.handleTimer();},get enabled(){return this._enabled;},set mode(m){this._mode=m;this._enabled&&this._mode=="auto"&&this.autoconf.loadPAC();this.handleTimer();},afterPropertiesSet:function(){this._enabled&&this._mode=="auto"&&this.autoconf.loadPAC();if(this._enabled&&this._mode=="manual"&&!this.manualconf.proxy){if(this.lastresort){this._mode="direct";}
else
this._enabled=false;}!this._enabled&&fp.proxies.maintainIntegrity(this,false,true,false);},handleTimer:function(){var ac=this.autoconf;ac.timer.cancel();if(this._enabled&&this._mode=="auto"&&ac._autoReload){ac.timer.initWithCallback(ac,ac._reloadFreqMins*60000,CI.nsITimer.TYPE_REPEATING_SLACK);}},get mode(){return this._mode;},isMatch:function(uriStr){var white=-1;for(var i=0;i<this.matches.length;i++){if(this.matches[i].enabled&&this.matches[i].regex.test(uriStr)){if(this.matches[i].isBlackList){return false;}
else if(white==-1){white=i;}}}
return white==-1?false:this.matches[white];},resolve:function(spec,host,mp){function _notifyUserOfError(spec){this.pacErrorNotification&&fp.notifier.alert(fp.getMessage("foxyproxy"),fp.getMessage("proxy.error.for.url")+spec);return null;}
var str=mp.pacResult=this.autoconf._resolver.getProxyForURI(spec,host);if(str&&str!=""){str=str.toLowerCase();var tokens=str.split(/\s*;\s*/),proxies=[];if(tokens[tokens.length-1]=="")
tokens.length--;for(var i=0;i<tokens.length;i++){var components=this.autoconf.parser.exec(tokens[i]);if(!components)continue;switch(components[1]){case"proxy":proxies.push(proxyService.newProxyInfo("http",components[2],components[3],0,0,null));break;case"socks":case"socks5":proxies.push(proxyService.newProxyInfo("socks",components[2],components[3],fp._proxyDNS?CI.nsIProxyInfo.TRANSPARENT_PROXY_RESOLVES_HOST:0,0,null));break;case"socks4":proxies.push(proxyService.newProxyInfo("socks4",components[2],components[3],fp._proxyDNS?CI.nsIProxyInfo.TRANSPARENT_PROXY_RESOLVES_HOST:0,0,null));break;case"direct":proxies.push(this.direct);break;default:return this._notifyUserOfError(spec);}}
for(var i=1;i<=proxies.length-1;i++){proxies[i-1].failoverTimeout=1800;proxies[i-1].failoverProxy=proxies[i];}
if(proxies[0]==null){return this._notifyUserOfError(spec);}
else if(proxies[1]){proxies[0].failoverTimeout=1800;proxies[0].failoverProxy=proxies[1];}
return proxies[0];}
else{return null;}},getProxy:function(spec,host,mp){switch(this._mode){case"manual":return this.manualconf.proxy;case"auto":return this.resolve(spec,host,mp);case"direct":return this.direct;}}};function Match(){this.wrappedJSObject=this;this.name=this.pattern="";this.isMultiLine=this._isRegEx=this.isBlackList=false;this.enabled=true;}
Match.prototype={QueryInterface:gQueryInterface,__registration:function(){return({topics:null,observerName:null,contractId:"@leahscape.org/foxyproxy/match;1",classId:Components.ID("{2b49ed90-f194-11da-8ad9-0800200c9a66}"),constructor:Match,className:"FoxyProxy Match Component"});},set pattern(p){this._pattern=p==null?"":p;this.buildRegEx();},get pattern(){return this._pattern;},set isRegEx(r){this._isRegEx=r;this.buildRegEx();},get isRegEx(){return this._isRegEx;},set isMultiLine(m){this._isMultiLine=m;this.buildRegEx();},get isMultiLine(){return this._isMultiLine;},buildRegEx:function(){var pat=this._pattern;if(!this._isRegEx){pat=pat.replace(/\./g,'\\.');pat=pat.replace(/\*/g,'.*');pat=pat.replace(/\?/g,'.');}
if(!this._isMultiLine){pat[0]!="^"&&(pat="^"+pat);pat[pat.length-1]!="$"&&(pat=pat+"$");}
try{this.regex=new RegExp(pat);}
catch(e){}},fromDOM:function(node){this.name=node.hasAttribute("notes")?node.getAttribute("notes"):(node.getAttribute("name")||"");this._isRegEx=node.getAttribute("isRegEx")=="true";this._pattern=node.hasAttribute("pattern")?node.getAttribute("pattern"):"";this.isBlackList=node.hasAttribute("isBlackList")?node.getAttribute("isBlackList")=="true":false;this.enabled=node.hasAttribute("enabled")?node.getAttribute("enabled")=="true":true;this.isMultiLine=node.hasAttribute("isMultiLine")?node.getAttribute("isMultiLine")=="true":false;},toDOM:function(doc){var matchElem=doc.createElement("match");matchElem.setAttribute("enabled",this.enabled);matchElem.setAttribute("name",this.name);matchElem.setAttribute("pattern",this._pattern);matchElem.setAttribute("isRegEx",this.isRegEx);matchElem.setAttribute("isBlackList",this.isBlackList);matchElem.setAttribute("isMultiLine",this._isMultiLine);return matchElem;}};function ManualConf(){this.wrappedJSObject=this;}
ManualConf.prototype={QueryInterface:gQueryInterface,_host:"",_port:"",_socksversion:"5",_isSocks:false,__registration:function(){return({topics:null,observerName:null,contractId:"@leahscape.org/foxyproxy/manualconf;1",classId:Components.ID("{457e4d50-f194-11da-8ad9-0800200c9a66}"),constructor:ManualConf,className:"FoxyProxy ManualConfiguration Component"});},fromDOM:function(node){this._host=node.hasAttribute("host")?node.getAttribute("host"):node.getAttribute("http")?node.getAttribute("http"):node.getAttribute("socks")?node.getAttribute("socks"):node.getAttribute("ssl")?node.getAttribute("ssl"):node.getAttribute("ftp")?node.getAttribute("ftp"):node.getAttribute("gopher")?node.getAttribute("gopher"):"";this._port=node.hasAttribute("port")?node.getAttribute("port"):node.getAttribute("httpport")?node.getAttribute("httpport"):node.getAttribute("socksport")?node.getAttribute("socksport"):node.getAttribute("sslport")?node.getAttribute("sslport"):node.getAttribute("ftpport")?node.getAttribute("ftpport"):node.getAttribute("gopherport")?node.getAttribute("gopherport"):"";this._socksversion=node.getAttribute("socksversion");this._isSocks=node.hasAttribute("isSocks")?node.getAttribute("isSocks")=="true":node.getAttribute("http")?false:node.getAttribute("ssl")?false:node.getAttribute("ftp")?false:node.getAttribute("gopher")?false:node.getAttribute("socks")?true:false;this._makeProxy();},toDOM:function(doc){var e=doc.createElement("manualconf");e.setAttribute("host",this._host);e.setAttribute("port",this._port);e.setAttribute("socksversion",this._socksversion);e.setAttribute("isSocks",this._isSocks);return e;},_makeProxy:function(){if(!this._host||!this._port){return;}
this.proxy=this._isSocks?proxyService.newProxyInfo(this._socksversion=="5"?"socks":"socks4",this._host,this._port,fp.proxyDNS?CI.nsIProxyInfo.TRANSPARENT_PROXY_RESOLVES_HOST:0,0,null):proxyService.newProxyInfo("http",this._host,this._port,0,0,null);},get host(){return this._host;},set host(e){this._host=e;this._makeProxy();},get port(){return this._port;},set port(e){this._port=e;this._makeProxy();},get isSocks(){return this._isSocks;},set isSocks(e){this._isSocks=e;this._makeProxy();},get socksversion(){return this._socksversion;},set socksversion(e){this._socksversion=e;this._makeProxy();}};function AutoConf(owner,node){this.wrappedJSObject=this;this.timer=CC["@mozilla.org/timer;1"].createInstance(CI.nsITimer);this.owner=owner;this.fromDOM(node);this._resolver=CC["@mozilla.org/network/proxy-auto-config;1"].createInstance(CI.nsIProxyAutoConfig);}
AutoConf.prototype={QueryInterface:gQueryInterface,parser:/\s*(\S+)\s*(?:([^:]+):?(\d*)\s*[;]?\s*)?/,status:0,error:null,loadNotification:true,errorNotification:true,url:"",_pac:"",_autoReload:false,_reloadFreqMins:60,__registration:function(){return({topics:null,observerName:null,contractId:"@leahscape.org/foxyproxy/autoconf;1",classId:Components.ID("{54382370-f194-11da-8ad9-0800200c9a66}"),constructor:AutoConf,className:"FoxyProxy AutoConfiguration Component"});},set autoReload(e){this._autoReload=e;if(!e&&this.timer){this.timer.cancel();}},get autoReload(){return this._autoReload;},set reloadFreqMins(e){if(isNaN(e)||e<1){e=60;}
else{this._reloadFreqMins=e;}},get reloadFreqMins(){return this._reloadFreqMins;},fromDOM:function(node){if(node){this.url=node.getAttribute("url");this.loadNotification=node.hasAttribute("loadNotification")?node.getAttribute("loadNotification")=="true":true;this.errorNotification=node.hasAttribute("errorNotification")?node.getAttribute("errorNotification")=="true":true;this._autoReload=node.hasAttribute("autoReload")?node.getAttribute("autoReload")=="true":true;this._reloadFreqMins=node.hasAttribute("reloadFreqMins")?node.getAttribute("reloadFreqMins"):60;}},toDOM:function(doc){var e=doc.createElement("autoconf");e.setAttribute("url",this.url);e.setAttribute("loadNotification",this.loadNotification);e.setAttribute("errorNotification",this.errorNotification);e.setAttribute("autoReload",this._autoReload);e.setAttribute("reloadFreqMins",this._reloadFreqMins);return e;},loadPAC:function(){this._pac="";try{var req=CC["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(CI.nsIXMLHttpRequest);req.open("GET",this.url,false);req.send(null);this.status=req.status;if(this.status==200||(this.status==0&&(this.url.indexOf("file://")==0||this.url.indexOf("ftp://")==0))){try{this._pac=req.responseText;this._resolver.init(this.url,this._pac);this.loadNotification&&fp.notifier.alert(fp.getMessage("pac.status"),fp.getMessage("pac.status.success",[this.owner.name]));this.owner._enabled=true;this.error=null;}
catch(e){this._pac="";this.badPAC("pac.status.error",e);}}
else{this.badPAC("pac.status.loadfailure");}}
catch(e){this.badPAC("pac.status.loadfailure",e);}},notify:function(timer){this.loadPAC();},badPAC:function(res,e){if(e){dump(e)+"\n";this.error=e;}
this.errorNotification&&fp.notifier.alert(fp.getMessage("pac.status"),fp.getMessage(res,[this.owner.name,this.status,this.error]));if(this.owner.lastresort)
this.owner.mode="direct";else
this.owner.enabled=false;}};function MatchingProxy(){this.wrappedJSObject=this;}
MatchingProxy.prototype={QueryInterface:gQueryInterface,errMsg:"",pacResult:"",_init:function(){this.randomMsg=fp.getMessage("proxy.random");this.allMsg=fp.getMessage("proxy.all.urls");this.regExMsg=fp.getMessage("foxyproxy.regex.label");this.wcMsg=fp.getMessage("foxyproxy.wildcard.label");this.blackMsg=fp.getMessage("foxyproxy.blacklist.label");this.whiteMsg=fp.getMessage("foxyproxy.whitelist.label");},init:function(proxy,aMatch,uriStr,type,errMsg){this.timestamp=Date.now();(!this.randomMsg&&this._init());this.uri=uriStr;this.proxy=proxy;this.proxyName=proxy.name;this.proxyNotes=proxy.notes;if(type=="pat"){this.matchName=aMatch.name;this.matchPattern=aMatch.pattern;this.matchType=aMatch.isRegEx?this.regExMsg:this.wcMsg;this.whiteBlack=aMatch.isBlackList?this.blackMsg:this.whiteMsg;}
else if(type=="ded"){this.whiteBlack=this.matchName=this.matchPattern=this.matchType=this.allMsg;}
else if(type=="rand"){this.matchName=this.matchPattern=this.matchType=this.whiteBlack=this.randomMsg;}
else if(type=="round"){}
else if(type=="err"){this.errMsg=errMsg;}
return this;},__registration:function(){return({topics:null,observerName:null,contractId:"@leahscape.org/foxyproxy/matchingproxy;1",classId:Components.ID("{c5338500-f195-11da-8ad9-0800200c9a66}"),constructor:MatchingProxy,className:"FoxyProxy MatchingProxy Component"});}};