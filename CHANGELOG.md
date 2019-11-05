# 1.1.0 (2019-11-05)

- Added a [TypeDoc](https://typedoc.org/) documentation provider and generator (used by the SKY UX CLI). [#11](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/11)
- Added a source code provider (for documentation code examples). [#11](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/11)

# 1.0.0 (2019-04-05)

- Major version release.

# 1.0.0-rc.6 (2019-01-18)

- Removed `@blackbaud/skyux-builder` from package peer dependencies. [#9](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/9)

# 1.0.0-rc.5 (2018-11-08)

- Added support for `@skyux/i18n#3.3.0` (via `@blackbaud/skyux-builder`), which provides a `getStringForLocale` utility method. [#8](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/8)

# 1.0.0-rc.4 (2018-11-02)

- Fixed plugin to resolve paths correctly. [#5](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/5)

# 1.0.0-rc.3 (2018-10-17)

- Fixed plugin to write resources providers during `skyux build-public-library`. [#3](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/3)

# 1.0.0-rc.2 (2018-10-17)

- Fixed generated class to use correct formatted locale.

# 1.0.0-rc.1 (2018-10-17)

- Added preload hook that statically injects the contents of locale resources files into TypeScript classes implementing `SkyAppResourcesProvider`. [#2](https://github.com/blackbaud/skyux-builder-plugin-skyux/pull/2)

# 1.0.0-rc.0 (2018-09-25)

- Initial release candidate.

# 1.0.0-alpha.0 (2018-09-13)

- Initial release to NPM.
