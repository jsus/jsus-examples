/*
---
name : Sheet.DOM
description : Sheet.DOM adds some handy stuff for working with the browser's native CSS capabilities.

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : Sheet.DOM
...
*/
;(function(document,styleSheets){

if (typeof Sheet == 'undefined') Sheet = {}
if (Sheet.DOM == null) Sheet.DOM = {}

Sheet.DOM.createSheet = function(raw){
	var	oldLength = styleSheets.length
	,	style
	,	sheet
	
	if (document.createStyleSheet){
		document.createStyleSheet()
		styleSheets[styleSheets.length - 1].cssText = raw
	}
	
	if (oldLength >= styleSheets.length){
		style = document.createElement('style')
		style.setAttribute('type','text/css')
		style.appendChild(document.createTextNode(raw))
		document.getElementsByTagName('head')[0].appendChild(style)
	}
	
	if (oldLength >= styleSheets.length){
		style = document.createElement('div')
		style.innerHTML = '<style type="text/css">' + String_escapeHTML.call(raw) + '</style>'
		document.getElementsByTagName('head')[0].appendChild(style)
	}
	
	if (oldLength >= styleSheets.length)
		throw new Error('no styleSheet added :(')
	
	sheet = styleSheets[styleSheets.length - 1]
	sheet.cssText = raw
	
	return sheet
}

Sheet.DOM.createStyle = function(raw){
	var div = document.createElement('div')
	div.innerHTML = '<p style="' + String_escapeHTML.call(raw) + '"></p>'
	return {style:div.firstChild.style}
}

function String_escapeHTML(){
	return ('' + this).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')
}


}(document, document.styleSheets));

/*
---
name : sg-regex-tools
description : A few super-handy tools for messing around with RegExp

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : [combineRegExp]
...
*/
;(function(exports){

exports.combineRegExp = function(regex, group){
	if (regex.source) regex = [regex]
	
	var names = [], i, source = '', this_source
	
	for (i = 0; i < regex.length; ++i){ if (!regex[i]) continue
		this_source = regex[i].source || ''+regex[i]
		if (this_source == '|') source += '|'
		else {
			source += (group?'(':'') + this_source.replace(/\s/g,'') + (group?')':'')
			if (group) names.push(group)
		}
		if (regex[i].names)	names = names.concat(regex[i].names)
	}
	regex = new RegExp(source,'gm')
	// [key] → 1
	for (i = -1; i < names.length; ++i) names[names[i]] = i + 1
	// [1] → key
	regex.names = names
	return regex
}

}(typeof exports != 'undefined' ? exports : this))

/*
---
name    : SheetParser.CSS

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : SheetParser.CSS
requires : combineRegExp
...
*/
;(function(exports){
	

/*<depend>*/
var UNDEF = {undefined:1}
if (!exports.SheetParser) exports.SheetParser = {}

/*<CommonJS>*/
var combineRegExp = UNDEF[typeof require]
	?	exports.combineRegExp
	:	require('./sg-regex-tools').combineRegExp
var SheetParser = exports.SheetParser
/*</CommonJS>*/

/*<debug>*/;if (UNDEF[typeof combineRegExp]) throw new Error('Missing required function: "combineRegExp"');/*</debug>*/
/*</depend>*/


var CSS = SheetParser.CSS = {version: '1.0.1'}

CSS.camelCase = function(string){
	return ('' + string).replace(camelCaseSearch, camelCaseReplace)
}
var camelCaseSearch = /-\D/g
function camelCaseReplace(match){
	return match.charAt(1).toUpperCase()
}

CSS.parse = function(cssText){
	var	found
	,	rule
	,	rules = {length:0}
	,	keyIndex = -1
	,	regex = this.parser
	,	names = CSS.parser.names
	,	i,r,l
	,	ruleCount
	
	rules.cssText = cssText = ('' + cssText)
	
	regex.lastIndex = 0
	while ((found = regex.exec(cssText))){
		// avoid an infinite loop on zero-length keys
		if (regex.lastIndex == found.index) ++ regex.lastIndex
		
		// key:value
		if (found[names._key]){
			rules[rules.length ++] = found[names._key]
			rules[found[names._key]] = found[names._value]
			rules[CSS.camelCase(found[names._key])] = found[names._value]
			continue
		}
		
		rules[rules.length++] = rule = {}
		for (i = -1, l = names.length; i < l; ++i){
			if (!found[i]) continue
			rule[names[i-1]] = found[i]
		}
	}
	
	for (i = -1, l = rules.length; i < l; ++i){
		if (!rules[i] || !rules[i].style_cssText) continue
		
		rules[i].style = CSS.parse(rules[i].style_cssText)
		
		for (ruleCount = -1, r = -1, rule; rule = rules[i].style[++r];){
			if (typeof rule == 'string') continue
			rules[i][r] = (rules[i].cssRules || (rules[i].cssRules = {}))[++ ruleCount]  = rule
			rules[i].cssRules.length = ruleCount + 1
			rules[i].rules = rules[i].cssRules
		}
	}
	
	return rules
}

var x = combineRegExp

;(CSS.at = x(/\s*(@[-a-zA-Z0-9]+)\s+([^;{]*)/))
.names=[         'kind',              'name']

CSS.atRule = x([CSS.at, ';'])

;(CSS.keyValue = x(/\s*([-a-zA-Z0-9]+):\s*(.*?)(?:;|(?=\})|$)/))
.names=[               '_key',               '_value']

;(CSS.comment = x(/\/\*\s*((?:[^*]|\*(?!\/))*)\s*\*\//))
.names=[                   'comment']

;(CSS.selector = x(/\s*((\d+%)|[^\{}]+?)\s*/))
.names=[               'selectorText','keyText']

;(CSS.block = x(/\{\s*((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})*)\s*\}/))
.names=[               'style_cssText']

CSS.selectorBlock = x([CSS.selector, CSS.block])

CSS.atBlock = x([CSS.at, CSS.block])

var OR = '|'

CSS.parser = x([
	x(CSS.comment)
	,OR
	,x(CSS.atBlock)
	,OR
	,x(CSS.atRule)
	,OR
	,x(CSS.selectorBlock)
	,OR
	,x(CSS.keyValue)
],'cssText')


})(typeof exports != 'undefined' ? exports : this);

/*
---
name    : Sheet

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : Sheet
requires : SheetParser.CSS
...
*/
;(function(exports){


/*<depend>*/
var UNDEF = {undefined:1}

/*<CommonJS>*/
var SheetParser = UNDEF[typeof require]
	?	exports.SheetParser
	:	require('./SheetParser.CSS').SheetParser

exports.Sheet = Sheet
/*</CommonJS>*/

/*<debug>*/;if (!(!UNDEF[typeof SheetParser] && SheetParser.CSS)) throw new Error('Missing required function: "SheetParser.CSS"');/*</debug>*/
/*</depend>*/


Sheet.version = '1.0.1'

function Sheet(cssText){
	if (this instanceof Sheet) this.initialize(cssText)
	else return Sheet.from(cssText)
}

Sheet.from = function(cssText){
	return new Sheet(cssText)
}

Sheet.prototype = {
	
	parser: SheetParser.CSS,
	
	initialize: function(cssText){
		this.cssText = cssText || ''
		this.style = this.rules = this.cssRules = this.parser.parse(this.cssText)
		var self = this
	},
	
	update: function(){
		var cssText = '',
			i = -1,
			rule,
			rules = this.style || this.rules || this.cssRules
		
		while ((rule = rules[++i])){
			if (typeof rule == 'object'){
				// cssRule
				if (this.update) rule.cssText = this.update.call(rule)
				cssText += rule.cssText = rule.selectorText + '{' + rule.cssText + '}'
			} else {
				// style key/value
				cssText += rule + ':'
				cssText += rules[rule] + ';'
			}
		}
		
		if (rules.selectorText)
			return rules.cssText = rules.selectorText + '{' + cssText + '}'
		return rules.cssText = cssText
	}
	
}

Sheet.prototype.toString = Sheet.prototype.update


}(typeof exports != 'undefined' ? exports : this));
