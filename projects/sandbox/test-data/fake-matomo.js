(function() {
  window.matomoLog = [];
  window._paq = {
    debug: () => {
      return paq;
    },
    push: (item) => {
      console.log('Fake Matomo: pushed ' + item);
      matomoLog.push(item);
    }
  };
  window._paq.push(window.location.href);
})();
