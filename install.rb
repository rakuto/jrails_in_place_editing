require 'fileutils'
include FileUtils

javascripts_dir = File.join(RAILS_ROOT, 'public', 'javascripts')
Dir.glob(File.join(File.dirname(__FILE__), 'javascripts', '*')).each do |js|
  cp js, File.join(RAILS_ROOT, 'public', 'javascripts')
  print '.'
end
puts
