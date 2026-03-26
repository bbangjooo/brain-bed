// swift-tools-version: 5.9

import PackageDescription

let package = Package(
  name: "KeyboardBlocker",
  platforms: [
    .macOS(.v12)
  ],
  targets: [
    .executableTarget(
      name: "KeyboardBlocker",
      path: "Sources"
    )
  ]
)
