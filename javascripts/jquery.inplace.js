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

/* $Id: jquery.inplace.js,v 0.9.9.2 2007/12/04 09:39:00 hauenstein Exp $ */

/**
  * jQuery inplace editor plugin.  
  *
  * Created by: David Hauenstein
  * http://www.davehauenstein.com/blog/
  *
  *
  * Nate Wiger (http://www.dangerrabbit.com) added callbacks, exposed 
  * more settings, added required values and "selected" options,
  * and enabled compatibility with jQuery.noConflict() mode.
  * Thanks to Joe and Vaska for helping me get this working on jQuery 1.1
  * Thanks to Pranav (http://www.startupdunia.com/) for finding a scope bug (0.9.4 release)
  * Thanks to Simon for finding some extraneous code (0.9.5 release)
  *
  *
  * @name  editInPlace
  * @type  jQuery
  * @param Hash    options						additional options 
  * @param String  options[url]					POST URL to send edited content
  * @param String  options[params]				paramters sent via the post request to the server; string; ex: name=dave&last_name=hauenstein
  * @param String  options[field_type]			can be: text, textarea, select; default: text
  * @param String  options[select_options]		this is a string seperated by commas for the dropdown options, if field_type is dropdown
  * @param String  options[textarea_cols]		number of columns textarea will have, if field_type is textarea; default: 25
  * @param String  options[textarea_rows]		number of rows textarea will have, if field_type is textarea; default: 10
  * @param String  options[bg_over]				background color of editable elements on HOVER
  * @param String  options[bg_out]				background color of editable elements on RESTORE from hover
  * @param String  options[saving_text]			text to be used when server is saving information; default: 'Saving...'
  * @param String  options[saving_image]		specify an image location instead of text while server is saving; default: uses saving text
  * @param String  options[value_required]		if set to true, the element will not be saved unless a value is entered
  * @param String  options[element_id]			name of parameter holding element_id; default: element_id
  * @param String  options[update_value]		name of parameter holding update_value; default: update_value
  * @param String  options[original_html]		name of parameter holding original_html; default: original_html
  * @param String  options[save_button]			image button tag to use as "Save" button
  * @param String  options[cancel_button]		image button tag to use as "Cancel" button
  * @param String  options[callback]			call function instead of submitting to url
  *             
  */

jQuery.fn.editInPlace = function(options) {

	//#######################################################################
	//DEFINE THE DEFAULT SETTINGS, SWITCH THEM WITH THE OPTIONS USER PROVIDES
	var settings = {
		url: "",
		params: "",
		field_type: "text",
		select_options: "",
		textarea_cols:  "25",
		textarea_rows:  "10",
		bg_over: "#ffc",
		bg_out:  "transparent",
		saving_text:   "Saving...",
		saving_image:  "",
		default_text:  "(Click here to add text)",
		select_text: "Choose new value",
		value_required: null,
		element_id:    "element_id",
		update_value:  "update_value",
		original_html: "original_html",
		save_button:   '<input type="submit" class="inplace_save" value="Save"/>',
		cancel_button: '<input type="submit" class="inplace_cancel" value="Cancel"/>',
		callback: null,
		success: null,
		error: function(request){
			alert("Failed to save value: " + request.responseText || 'Unspecified Error');
		}
	};

	if(options) {
		jQuery.extend(settings, options);
	}

	//#######################################################################
	//preload the loading icon if it exists
	if(settings.saving_image != ""){
		var loading_image = new Image();
		loading_image.src = settings.saving_image;
	}

	//#######################################################################
	//THIS FUNCTION WILL TRIM WHITESPACE FROM BEFORE/AFTER A STRING
	String.prototype.trim = function() {
		return this.replace(/^\s+/, '')
							 .replace(/\s+$/, '');
	};

	//#######################################################################
	//THIS FUNCTION WILL ESCAPE ANY HTML ENTITIES SO "Quoted Values" work
	String.prototype.escape_html = function() {
		return this.replace(/&/g, "&amp;")
							 .replace(/</g, "&lt;")
							 .replace(/>/g, "&gt;")
							 .replace(/"/g, "&quot;");
  };

	//#######################################################################
	//CREATE THE INPLACE EDITOR
	return this.each(function(){

		if(jQuery(this).html() == "") jQuery(this).html(settings.default_text);

		var editing = false;

		//save the original element - for change of scope
		var original_element = jQuery(this);

		var click_count = 0;

		jQuery(this)

		.mouseover(function(){
			jQuery(this).css("background", settings.bg_over);
		})

		.mouseout(function(){
			jQuery(this).css("background", settings.bg_out);
		})

		.click(function(){
			click_count++;

			if(!editing)
			{
				editing = true;

				//save original text - for cancellation functionality
				var original_html = jQuery(this).html();
				var buttons_code  = settings.save_button + ' ' + settings.cancel_button;

				//if html is our default text, clear it out to prevent saving accidentally
				if (original_html == settings.default_text) jQuery(this).html('');

				if (settings.field_type == "textarea")
				{
					var use_field_type = '<textarea name="inplace_value" class="inplace_field" rows="' + settings.textarea_rows +
										 '" cols="' + settings.textarea_cols + '">' + jQuery(this).text().trim().escape_html() +
										 '</textarea>';
				}
				else if(settings.field_type == "text")
				{
					var use_field_type = '<input type="text" name="inplace_value" class="inplace_field" value="' +
											jQuery(this).text().trim().escape_html() + '" />';
				}
				else if(settings.field_type == "select")
				{
					var optionsArray = settings.select_options.split(',');
					var use_field_type = '<select name="inplace_value" class="inplace_field"><option value="">' + 
																settings.select_text + '</option>';
						for(var i=0; i<optionsArray.length; i++){
							var optionsValuesArray = optionsArray[i].split(':');
							var use_value = optionsValuesArray[1] || optionsValuesArray[0];
							var selected = use_value == original_html ? 'selected="selected" ' : '';
							use_field_type += '<option ' + selected + 'value="' + use_value.trim().escape_html() + '">' + 
												optionsValuesArray[0].trim().escape_html() + '</option>';
                        }
						use_field_type += '</select>';
				}

				//insert the new in place form after the element they click, then empty out the original element
				jQuery(this).html('<form class="inplace_form" style="display: inline; margin: 0; padding: 0;">' +
									use_field_type + ' ' + buttons_code + '</form>');

			}//END- if(!editing) -END

			if(click_count == 1)
			{
				//set the focus to the new input element
				original_element.children("form").children(".inplace_field").focus().select();

				//HIT ESC KEY
				$(document).keyup(function(event){
				    if (event.keyCode == 27) {
				        editing = false;
						click_count = 0;

						//put the original background color in
						original_element.css("background", settings.bg_out);

						//put back the original text
						original_element.html(original_html);

						return false;
				    }
				});

				//CLICK CANCEL BUTTON functionality
				original_element.children("form").children(".inplace_cancel").click(function(){
					editing = false;
					click_count = 0;

					//put the original background color in
					original_element.css("background", settings.bg_out);

					//put back the original text
					original_element.html(original_html);

					return false;
				});

				//CLICK SAVE BUTTON functionality
				original_element.children("form").children(".inplace_save").click(function(){
					//put the original background color in
					original_element.css("background", settings.bg_out);

					var new_html = jQuery(this).parent().children(0).val();
				
					//set saving message
					if(settings.saving_image != ""){
						var saving_message = '<img src="' + settings.saving_image + '" alt="Saving..." />';
					} else {
						var saving_message = settings.saving_text;
					}

					//place the saving text/image in the original element
					original_element.html(saving_message);

					if(settings.params != ""){
						settings.params = "&" + settings.params;
					}

					if(settings.callback) {
						html = settings.callback(original_element.attr("id"), new_html, original_html, settings.params);
						editing = false;
						click_count = 0;
						if (html) {
							// put the newly updated info into the original element
							original_element.html(html || new_html);
						} else {
							// failure; put original back
							alert("Failed to save value: " + new_html);
							original_element.html(original_html);
						}
					} else if (settings.value_required && new_html == "") {
						editing = false;
						click_count = 0;
						original_element.html(original_html);
						alert("Error: You must enter a value to save this field");
					} else {
						jQuery.ajax({
							url: settings.url,
							type: "POST",
							data: settings.update_value + '=' + new_html + '&' + settings.element_id + '=' + 
									original_element.attr("id") + settings.params + 
									'&' + settings.original_html + '=' + original_html,
							dataType: "html",
							complete: function(request){
								editing = false;
								click_count = 0;
							},
							success: function(html){
								// if the text returned by the server is empty, 
   							// put a marker as text in the original element
								var new_text = html || settings.default_text;

								// put the newly updated info into the original element
								original_element.html(new_text);
								if (settings.success) settings.success(html, original_element);
							},
							error: function(request) {
								original_element.html(original_html);
								if (settings.error) settings.error(request, original_element);
							}
						});
					}

					return false;
				});
			}//END- if(click_count == 1) -END

		});

	});

};