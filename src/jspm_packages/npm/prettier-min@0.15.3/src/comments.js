var assert=require("assert"),types=require("ast-types"),n=types.namedTypes,isArray=types.builtInTypes.array,isObject=types.builtInTypes.object,docBuilders=require("./doc-builders"),fromString=docBuilders.fromString,concat=docBuilders.concat,hardline=docBuilders.hardline,breakParent=docBuilders.breakParent,indent=docBuilders.indent,lineSuffix=docBuilders.lineSuffix,util=require("./util"),comparePos=util.comparePos,childNodesCacheKey=Symbol("child-nodes"),locStart=util.locStart,locEnd=util.locEnd;function getSortedChildNodes(a,b,c){if(a){if(util.fixFaultyLocations(a,b),c){if(n.Node.check(a)&&"EmptyStatement"!==a.type){for(var d=c.length-1;0<=d&&!(0>=locEnd(c[d])-locStart(a));--d);return void c.splice(d+1,0,a)}}else if(a[childNodesCacheKey])return a[childNodesCacheKey];var e;if(isArray.check(a))e=Object.keys(a);else if(isObject.check(a))e=types.getFieldNames(a);else return;c||Object.defineProperty(a,childNodesCacheKey,{value:c=[],enumerable:!1});for(var d=0,f=e.length;d<f;++d)getSortedChildNodes(a[e[d]],b,c);return c}}function decorateComment(a,b,c){for(var e,f,d=getSortedChildNodes(a,c),g=0,h=d.length;g<h;){var j=g+h>>1,k=d[j];if(0>=locStart(k)-locStart(b)&&0>=locEnd(b)-locEnd(k))return b.enclosingNode=k,void decorateComment(k,b,c);if(0>=locEnd(k)-locStart(b)){e=k,g=j+1;continue}if(0>=locEnd(b)-locStart(k)){f=k,h=j;continue}throw new Error("Comment location overlaps with node location")}e&&(b.precedingNode=e),f&&(b.followingNode=f)}function attach(a,b,c){if(isArray.check(a)){var d=[];a.forEach(function(e){decorateComment(b,e,c);const f=e.precedingNode,g=e.enclosingNode,h=e.followingNode;if(util.hasNewline(c,locStart(e),{backwards:!0}))handleMemberExpressionComment(g,h,e)||handleIfStatementComments(g,h,e)||handleTryStatementComments(g,h,e)||(h?addLeadingComment(h,e):f?addTrailingComment(f,e):g?addDanglingComment(g,e):addDanglingComment(b,e));else if(util.hasNewline(c,locEnd(e)))f?addTrailingComment(f,e):h?addLeadingComment(h,e):g?addDanglingComment(g,e):addDanglingComment(b,e);else if(f&&h){const k=d.length;if(0<k){var j=d[k-1];j.followingNode!==e.followingNode&&breakTies(d,c)}d.push(e)}else f?addTrailingComment(f,e):h?addLeadingComment(h,e):g?addDanglingComment(g,e):addDanglingComment(b,e)}),breakTies(d,c),a.forEach(function(e){delete e.precedingNode,delete e.enclosingNode,delete e.followingNode})}}function breakTies(a,b){var c=a.length;if(0!==c){for(var h,d=a[0].precedingNode,e=a[0].followingNode,f=locStart(e),g=c;0<g;--g){h=a[g-1],assert.strictEqual(h.precedingNode,d),assert.strictEqual(h.followingNode,e);var j=b.slice(locEnd(h),f);if(/\S/.test(j))break;f=locStart(h)}a.forEach(function(k,l){l<g?addTrailingComment(d,k):addLeadingComment(e,k)}),a.length=0}}function addCommentHelper(a,b){var c=a.comments||(a.comments=[]);c.push(b)}function addLeadingComment(a,b){b.leading=!0,b.trailing=!1,addCommentHelper(a,b)}function addDanglingComment(a,b){b.leading=!1,b.trailing=!1,addCommentHelper(a,b)}function addTrailingComment(a,b){b.leading=!1,b.trailing=!0,addCommentHelper(a,b)}function addBlockStatementFirstComment(a,b){0===a.body.length?addDanglingComment(a,b):addLeadingComment(a.body[0],b)}function addBlockOrNotComment(a,b){"BlockStatement"===a.type?addBlockStatementFirstComment(a,b):addLeadingComment(a,b)}function handleIfStatementComments(a,b,c){return a&&"IfStatement"===a.type&&b&&("BlockStatement"===b.type?(addBlockStatementFirstComment(b,c),!0):!("IfStatement"!==b.type)&&(addBlockOrNotComment(b.consequent,c),!0))}function handleTryStatementComments(a,b,c){return a&&"TryStatement"===a.type&&b&&("BlockStatement"===b.type?(addBlockStatementFirstComment(b,c),!0):"TryStatement"===b.type?(addBlockOrNotComment(b.finalizer,c),!0):!("CatchClause"!==b.type)&&(addBlockOrNotComment(b.body,c),!0))}function handleMemberExpressionComment(a,b,c){return a&&"MemberExpression"===a.type&&b&&"Identifier"===b.type&&(addLeadingComment(a,c),!0)}function printComment(a){const b=a.getValue();switch(b.type){case"CommentBlock":case"Block":return"/*"+b.value+"*/";case"CommentLine":case"Line":return"//"+b.value;default:throw new Error("Not a comment: "+JSON.stringify(b));}}function printLeadingComment(a,b,c){const d=a.getValue(),e=printComment(a),f=c.originalText,g="Block"===d.type||"CommentBlock"===d.type;return g?concat([e,util.hasNewline(c.originalText,locEnd(d))?hardline:" "]):concat([e,hardline])}function printTrailingComment(a,b,c){const e=a.getValue(),f=printComment(a),g="Block"===e.type||"CommentBlock"===e.type;if(util.hasNewline(c.originalText,locStart(e),{backwards:!0}))return concat([hardline,f]);return g?concat([" ",f]):concat([lineSuffix(" "+f),g?"":breakParent])}function printDanglingComments(a,b,c){const d=b.originalText,e=[],f=a.getValue();return f&&f.comments?(a.each(g=>{const h=g.getValue();h.leading||h.trailing||(util.hasNewline(d,locStart(h),{backwards:!0})&&e.push(hardline),e.push(printComment(g)))},"comments"),c?concat(e):indent(b.tabWidth,concat(e))):""}function printComments(a,b,c){var d=a.getValue(),e=a.getParentNode(),f=b(a),g=n.Node.check(d)&&types.getFieldValue(d,"comments");if(!g||0===g.length)return f;var h=[],j=[f];return a.each(function(k){var l=k.getValue(),m=types.getFieldValue(l,"leading"),o=types.getFieldValue(l,"trailing");if(m){h.push(printLeadingComment(k,b,c));const p=c.originalText;util.hasNewline(p,util.skipNewline(p,util.locEnd(l)))&&h.push(hardline)}else o&&j.push(printTrailingComment(k,b,c,e))},"comments"),concat(h.concat(j))}module.exports={attach,printComments,printDanglingComments};
