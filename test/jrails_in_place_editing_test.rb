require File.expand_path(File.join(File.dirname(__FILE__), '../../../../test/test_helper'))
require 'test/unit'

class JrailsInPlaceEditingTest < Test::Unit::TestCase
  include InPlaceEditing
  include InPlaceMacrosHelper

  include ActionView::Helpers::UrlHelper
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::FormHelper
  include ActionView::Helpers::CaptureHelper

  def test_in_place_field_type_is_textarea
    assert_dom_equal %(<script type=\"text/javascript\">\n//<![CDATA[\n$('#foo').editInPlace({field_type:'textarea', textarea_cols:25, textarea_rows:10, update_value:'value', url:'/update'})\n//]]>\n</script>), in_place_editor('foo', :field_type => 'textarea', :url => '/update')
  end

  def test_in_place_editor_saving_text
    assert_dom_equal %(<script type=\"text/javascript\">\n//<![CDATA[\n$('#foo').editInPlace({saving_text:'saving', update_value:'value', url:''})\n//]]>\n</script>), in_place_editor('foo', {:saving_text => 'saving'})
  end

end
