# 1.3.1 (2020-02-15)

- Fixed an issue with the pipeline to address invalid release to NPM.

# 1.3.0 (2020-02-15)

- Added support for `TypeDoc@0.16.9`. [#22](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/22)
- Removed deep imports into `@skyux/i18n`. [#22](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/22)

# 1.2.2 (2020-02-06)

- Adjusted the installation warning message to communicate that the `@skyux/docs-tools` package is optional. [#21](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/21)

# 1.2.1 (2019-11-13)

- Fixed the TypeDoc config to include the `code-examples` directory. [#18](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/18)

# 1.2.0 (2019-11-07)

- Added the documentation providers plugin to automatically provide the source code and TypeDoc JSON providers if the consuming application omits them. [#16](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/16)
- Fixed the source code and TypeDoc JSON providers to only run if `@skyux/docs-tools` is installed in the consuming application. [#16](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/16)

# 1.1.0 (2019-11-05)

- Added a [TypeDoc](https://typedoc.org/) documentation provider and generator for the SKY UX CLI. [#11](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/11)
- Added a source code provider for documentation code examples. [#11](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/11)

# 1.0.0 (2019-04-05)

- Major version release.

# 1.0.0-rc.6 (2019-01-18)

- Removed `@blackbaud/skyux-builder` from package peer dependencies. [#9](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/9)

# 1.0.0-rc.5 (2018-11-08)

- Added support for `@skyux/i18n#3.3.0` (via `@blackbaud/skyux-builder`), which provides a `getStringForLocale` utility method. [#8](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/8)

# 1.0.0-rc.4 (2018-11-02)

- Fixed the plugin to resolve paths correctly. [#5](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/5)

# 1.0.0-rc.3 (2018-10-17)

- Fixed the plugin to write resources providers during `skyux build-public-library`. [#3](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/3)

# 1.0.0-rc.2 (2018-10-17)

- Fixed a generated class to use correct formatted locale.

# 1.0.0-rc.1 (2018-10-17)

- Added a preload hook that statically injects the contents of locale resources files into TypeScript classes implementing `SkyAppResourcesProvider`. [#2](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/2)

# 1.0.0-rc.0 (2018-09-25)

- Initial release candidate.

# 1.0.0-alpha.0 (2018-09-13)

- Initial release to NPM.
