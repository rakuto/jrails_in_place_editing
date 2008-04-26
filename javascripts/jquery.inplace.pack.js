/*
+-----------------------------------------------------------------------+
| Copyright (c) 2007 David Hauenstein			                        |
| All rights reserved.                                                  |
|                                                                       |
| Redistribution and use in source and binary forms, with or without    |
| modification, are permitted provided that the following conditions    |
| are met:                                                              |
|                                                                       |
| o Redistributions of source code must retain the above copyright      |
|   notice, this list of conditions and the following disclaimer.       |
| o Redistributions in binary form must reproduce the above copyright   |
|   notice, this list of conditions and the following disclaimer in the |
|   documentation and/or other materials provided with the distribution.|
|                                                                       |
| THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS   |
| "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT     |
| LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR |
| A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT  |
| OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, |
| SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT      |
| LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, |
| DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY |
| THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT   |
| (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE |
| OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.  |
|                                                                       |
+-----------------------------------------------------------------------+
*/
jQuery.fn.editInPlace=function(A){var B={url:"",params:"",field_type:"text",select_options:"",textarea_cols:"25",textarea_rows:"10",bg_over:"#ffc",bg_out:"transparent",saving_text:"Saving...",saving_image:"",default_text:"(Click here to add text)",select_text:"Choose new value",value_required:null,element_id:"element_id",update_value:"update_value",original_html:"original_html",save_button:'<input type="submit" class="inplace_save" value="Save"/>',cancel_button:'<input type="submit" class="inplace_cancel" value="Cancel"/>',callback:null,success:null,error:function(D){alert("Failed to save value: "+D.responseText||"Unspecified Error")}};if(A){jQuery.extend(B,A)}if(B.saving_image!=""){var C=new Image();C.src=B.saving_image}String.prototype.trim=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")};String.prototype.escape_html=function(){return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};return this.each(function(){if(jQuery(this).html()==""){jQuery(this).html(B.default_text)}var D=false;var E=jQuery(this);var F=0;jQuery(this).mouseover(function(){jQuery(this).css("background",B.bg_over)}).mouseout(function(){jQuery(this).css("background",B.bg_out)}).click(function(){F++;if(!D){D=true;var H=jQuery(this).html();var G=B.save_button+" "+B.cancel_button;if(H==B.default_text){jQuery(this).html("")}if(B.field_type=="textarea"){var M='<textarea name="inplace_value" class="inplace_field" rows="'+B.textarea_rows+'" cols="'+B.textarea_cols+'">'+jQuery(this).text().trim().escape_html()+"</textarea>"}else{if(B.field_type=="text"){var M='<input type="text" name="inplace_value" class="inplace_field" value="'+jQuery(this).text().trim().escape_html()+'" />'}else{if(B.field_type=="select"){var I=B.select_options.split(",");var M='<select name="inplace_value" class="inplace_field"><option value="">'+B.select_text+"</option>";for(var J=0;J<I.length;J++){var L=I[J].split(":");var N=L[1]||L[0];var K=N==H?'selected="selected" ':"";M+="<option "+K+'value="'+N.trim().escape_html()+'">'+L[0].trim().escape_html()+"</option>"}M+="</select>"}}}jQuery(this).html('<form class="inplace_form" style="display: inline; margin: 0; padding: 0;">'+M+" "+G+"</form>")}if(F==1){E.children("form").children(".inplace_field").focus().select();$(document).keyup(function(O){if(O.keyCode==27){D=false;F=0;E.css("background",B.bg_out);E.html(H);return false}});E.children("form").children(".inplace_cancel").click(function(){D=false;F=0;E.css("background",B.bg_out);E.html(H);return false});E.children("form").children(".inplace_save").click(function(){E.css("background",B.bg_out);var P=jQuery(this).parent().children(0).val();if(B.saving_image!=""){var O='<img src="'+B.saving_image+'" alt="Saving..." />'}else{var O=B.saving_text}E.html(O);if(B.params!=""){B.params="&"+B.params}if(B.callback){html=B.callback(E.attr("id"),P,H,B.params);D=false;F=0;if(html){E.html(html||P)}else{alert("Failed to save value: "+P);E.html(H)}}else{if(B.value_required&&P==""){D=false;F=0;E.html(H);alert("Error: You must enter a value to save this field")}else{jQuery.ajax({url:B.url,type:"POST",data:B.update_value+"="+P+"&"+B.element_id+"="+E.attr("id")+B.params+"&"+B.original_html+"="+H,dataType:"html",complete:function(Q){D=false;F=0},success:function(R){var Q=R||B.default_text;E.html(Q);if(B.success){B.success(R,E)}},error:function(Q){E.html(H);if(B.error){B.error(Q,E)}}})}}return false})}})})}
