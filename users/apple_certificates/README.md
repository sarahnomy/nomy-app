# Apple public root certificates

Public verification certificates, not private purchase keys. Downloaded from:

- https://www.apple.com/certificateauthority/AppleRootCA-G2.cer
- https://www.apple.com/certificateauthority/AppleRootCA-G3.cer

Apple's official App Store Server Library verifies transaction and notification
certificate chains against these roots. Online certificate checks are enabled.
Ship these files with the backend. Never place a private `.p8` key here.
