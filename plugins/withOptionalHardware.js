// Marks hardware features Vinster doesn't need as optional, so Google Play
// offers the app on every device. Some libraries imply them — a portrait-only
// screen implies a portrait display, a Wi-Fi permission implies Wi-Fi hardware —
// and Play then hides the app from devices without them (tablets used in
// landscape, desktops, Android XR, phones with no Wi-Fi).
const { withAndroidManifest } = require('@expo/config-plugins');

const OPTIONAL_FEATURES = ['android.hardware.screen.portrait', 'android.hardware.wifi'];

module.exports = function withOptionalHardware(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const features = (manifest['uses-feature'] ?? []).filter((f) => !OPTIONAL_FEATURES.includes(f.$['android:name']));
    for (const name of OPTIONAL_FEATURES) features.push({ $: { 'android:name': name, 'android:required': 'false' } });
    manifest['uses-feature'] = features;
    return cfg;
  });
};
