// Google Ads tag. Set VITE_GOOGLE_ADS_ID (e.g. AW-123456789) and
// VITE_GOOGLE_ADS_BOOKING_LABEL (the conversion label for "Booking") at build time.
// If the ID is unset, nothing is loaded.
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const BOOKING_LABEL = import.meta.env.VITE_GOOGLE_ADS_BOOKING_LABEL;

export function initAnalytics() {
  if (!ADS_ID || typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views are sent manually on route changes (see trackPageView).
  window.gtag('config', ADS_ID, { send_page_view: false });
}

export function trackPageView(path) {
  if (!ADS_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    send_to: ADS_ID,
    page_path: path,
    page_location: window.location.href,
  });
}

export function trackBookingConversion({ value, transactionId } = {}) {
  if (!ADS_ID || !BOOKING_LABEL || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: `${ADS_ID}/${BOOKING_LABEL}`,
    value: value || 0,
    currency: 'INR',
    transaction_id: transactionId || '',
  });
}
