require 'jrails_in_place_editing'
require 'jrails_in_place_macros_helper'

ActionView::Helpers::AssetTagHelper::JAVASCRIPT_DEFAULT_SOURCES << 'jquery.inplace.pack.js'
ActionView::Helpers::AssetTagHelper::reset_javascript_include_default
ActionController::Base.send :include, InPlaceEditing
ActionController::Base.helper InPlaceMacrosHelper
