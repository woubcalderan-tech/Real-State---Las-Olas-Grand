(() => {
  const measurementId = 'G-R1PY3QDRLB';
  const preferenceKey = 'unit2010-analytics-v1';
  const disableKey = 'ga-disable-' + measurementId;
  const language = document.documentElement.lang === 'es' ? 'es' : 'en';
  const footer = document.querySelector('.foot .wrap');
  if (!footer) return;

  const text = language === 'es' ? {
    title: 'Preferencias de analítica',
    notice: 'Google Analytics es opcional. Si lo permite, usaremos cookies de analítica para medir visitas y clics de contacto. Puede cambiar su elección aquí en cualquier momento.',
    allow: 'Permitir analítica',
    decline: 'No permitir analítica',
    enabled: 'Analítica permitida.',
    disabled: 'Analítica desactivada.',
  } : {
    title: 'Analytics preferences',
    notice: 'Google Analytics is optional. If you allow it, we use analytics cookies to measure visits and contact clicks. You can change your choice here at any time.',
    allow: 'Allow analytics',
    decline: 'Decline analytics',
    enabled: 'Analytics allowed.',
    disabled: 'Analytics off.',
  };

  const preferences = document.createElement('details');
  preferences.innerHTML = '<summary></summary><p></p><button type="button"></button> <button type="button"></button><p role="status"></p>';
  const [summary, notice, allow, decline, status] = preferences.children;
  summary.textContent = text.title;
  notice.textContent = text.notice;
  allow.textContent = text.allow;
  decline.textContent = text.decline;
  footer.append(preferences);

  const denied = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
  let started = false;
  let allowed = false;

  function getPreference() {
    try {
      return localStorage.getItem(preferenceKey) === 'granted';
    } catch {
      return allowed;
    }
  }

  function startAnalytics() {
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('consent', 'default', denied);
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: document.referrer ? new URL(document.referrer).origin : '',
    });

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(tag);
  }

  function applyPreference(granted) {
    const changed = granted !== allowed;
    allowed = granted;
    window[disableKey] = !allowed;
    status.textContent = allowed ? text.enabled : text.disabled;
    if (allowed && !started) {
      startAnalytics();
    } else if (started && changed) {
      window.gtag('consent', 'update', { analytics_storage: allowed ? 'granted' : 'denied' });
    }
  }

  function savePreference(granted) {
    try {
      localStorage.setItem(preferenceKey, granted ? 'granted' : 'denied');
    } catch {
      // When storage is unavailable, the choice still applies to this page.
    }
    applyPreference(granted);
  }

  allow.addEventListener('click', () => savePreference(true));
  decline.addEventListener('click', () => savePreference(false));
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey || event.key === null) applyPreference(getPreference());
  });
  window.addEventListener('pageshow', () => applyPreference(getPreference()));
  applyPreference(getPreference());

  document.addEventListener('click', event => {
    if (!allowed || event.defaultPrevented || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-contact-role], a[data-showing-cta]');
    if (!link) return;

    const page = { page_language: language, page_path: location.pathname };
    if (link.dataset.contactRole) {
      window.gtag('event', 'contact_click', {
        ...page,
        contact_role: link.dataset.contactRole,
        contact_method: link.dataset.contactMethod,
      });
    } else {
      window.gtag('event', 'showing_interest', {
        ...page,
        cta_type: link.dataset.showingCta,
        interest_stage: 'initial_click',
      });
    }
  });
})();
