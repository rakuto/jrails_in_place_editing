module InPlaceMacrosHelper
  # Makes an HTML element specified by the DOM ID +field_id+ become an in-place
  # editor of a property.
  #
  # A form is automatically created and displayed when the user clicks the element,
  # something like this:
  #   <form id="myElement-in-place-edit-form" target="specified url">
  #     <input name="value" text="The content of myElement"/>
  #     <input type="submit" value="ok"/>
  #     <a onclick="javascript to cancel the editing">cancel</a>
  #   </form>
  # 
  # The form is serialized and sent to the server using an AJAX call, the action on
  # the server should process the value and return the updated value in the body of
  # the reponse. The element will automatically be updated with the changed value
  # (as returned from the server).
  # 
  # Required +options+ are:
  # <tt>:url</tt>::       Specifies the url where the updated value should
  #                       be sent after the user presses "ok".
  # 
  # Addtional +options+ are:
  # <tt>field_type</tt>::       can be: text, textarea, select; default: text
  # <tt>select_options</tt>::   this is an array for the dropdown options, if field_type is 'select'
  # <tt>textarea_cols</tt>::    number of columns textarea will have, if field_type is textarea; default: 25 
  # <tt>textarea_rows</tt>::    number of rows textarea will have, if field_type is textarea; default: 10 
  # <tt>bg_over</tt>::          background color of editable elements on HOVER
  # <tt>bg_out</tt>::           background color of editable elements on RESTORE from hover 
  # <tt>saving_text</tt>::      text to be used when server is saving information; default: 'Saving...''' 
  # <tt>saving_image</tt>::     specify an image location instead of text while server is saving; default: uses saving text 
  # <tt>value_required</tt>::   if set to true, the element will not be saved unless a value is entered
  # <tt>original_html</tt>::    name of parameter holding original_html; default: original_html
  # <tt>save_button</tt>::      image button tag to use as "Save" button""
  # <tt>cancel_button</tt>::    image button tag to use as "Cancel" button""
  # <tt>callback</tt>::         call function instead of submitting to url
  def in_place_editor(field_id, options = {})
    function = "$('##{field_id}').editInPlace("

    js_options = {}
    js_options['url'] = "'" + options[:url] + "'"
    if respond_to?(:protect_against_forgery?) && protect_against_forgery?
      js_options['params'] = "'#{request_forgery_protection_token}=' + encodeURIComponent('#{escape_javascript form_authenticity_token}')"
    end
    js_options['filed_type'] = "'" + options[:field_type] + "'" if options[:field_type]
    js_options['select_options'] = "'" + (options[:select_options].is_a?(Array)?
      options[:select_options].join(',') : options[:select_options]) + "'" if js_options[:options].to_s == 'select'
    js_options['textarea_cols'] = options[:textarea_cols].to_i if options[:field_type].to_s == 'textarea'
    js_options['textarea_rows'] = options[:textarea_rows].to_i if options[:textarea_rows].to_s == 'textarea'
    js_options['bg_over'] = "'" + options[:bg_over] + "'" if options[:bg_over]
    js_options['bg_out'] = "'" + options[:bg_out] + "'" if options[:bg_out]
    js_options['saving_text'] = "'" + options[:saving_text] + "'" if options[:saving_text] 
    js_options['saving_image'] = "'" + options[:saving_image] + "'" if options[:saving_image]
    js_options['value_required'] = !!options[:value_required] if options[:value_required]
    js_options['update_value'] = "'value'"
    js_options['save_button'] = options[:save_button] if options[:save_button]
    js_options['cancel_button'] = options[:cancel_button] if options[:cancel_button]
    js_options['callback'] = %{function() {#{options[:callback]}}} if options[:callback]

    function << options_for_javascript(js_options)
    function << ')'

    javascript_tag(function)
  end
  
  # Renders the value of the specified object and method with in-place editing capabilities.
  def in_place_editor_field(object, method, tag_options = {}, in_place_editor_options = {})
    tag = ::ActionView::Helpers::InstanceTag.new(object, method, self)
    tag_options = {:tag => "span", :id => "#{object}_#{method}_#{tag.object.id}_in_place_editor", :class => "in_place_editor_field"}.merge!(tag_options)
    in_place_editor_options[:url] = in_place_editor_options[:url] || url_for({ :action => "set_#{object}_#{method}", :id => tag.object.id })
    tag.to_content_tag(tag_options.delete(:tag), tag_options) +
    in_place_editor(tag_options[:id], in_place_editor_options)
  end
end
