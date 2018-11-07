module.exports = {
  getString: function (resources, preferredLocale, name) {
    // Need 'var' to appease TypeScript minification.
    var defaultLocale = 'en-US';

    function getResourcesForLocale(locale) {
      var parsedLocale = locale.toUpperCase().replace('_', '-');
      return resources[parsedLocale];
    }

    var values = getResourcesForLocale(preferredLocale);

    if (values && values[name]) {
      return values[name];
    }

    // Attempt to locate default resources.
    values = getResourcesForLocale(defaultLocale);

    if (values && values[name]) {
      return values[name];
    }

    return '';
  }
};
