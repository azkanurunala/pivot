Pod::Spec.new do |s|
  s.name           = 'ExpoGameCenter'
  s.version        = '1.0.0'
  s.summary        = 'Game Center (GameKit) bridge for Pivot'
  s.description    = 'Authenticate, submit scores, present + load leaderboards.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.0' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
  s.frameworks = 'GameKit', 'UIKit'

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
