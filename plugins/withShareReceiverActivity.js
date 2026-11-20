// Android shares go through a tiny "doorway" activity instead of MainActivity.
//
// Why: a share from the Google app or Chrome asks Android to open the target
// inside the SHARING app's window. When MainActivity received it there, a second
// copy of Vinster's screen (with its own React tree) started inside that window;
// expo-share-intent then closed it and re-sent the share to Vinster's own
// window, but the short-lived copy had already taken over expo-router's
// navigation — the real screen's jump to Wine List Preferences then crashed
// ("Attempted to navigate before mounting the Root Layout") to a white page.
//
// ShareReceiverActivity loads no React at all: it forwards the share to
// MainActivity in Vinster's own task and closes. MainActivity (singleTask)
// receives it through onNewIntent / onCreate, where expo-share-intent picks it
// up as usual. expo-share-intent's own Android manifest setup is switched off
// (disableAndroid in app.json) so MainActivity no longer receives shares
// directly.
const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const ACTIVITY = '.ShareReceiverActivity';

function withShareReceiverManifest(config, { mimeTypes }) {
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    const main = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
    // One Vinster screen, always in Vinster's own task.
    main.$['android:launchMode'] = 'singleTask';

    app.activity = (app.activity ?? []).filter((a) => a.$['android:name'] !== ACTIVITY);
    app.activity.push({
      $: {
        'android:name': ACTIVITY,
        'android:exported': 'true',
        'android:theme': '@android:style/Theme.Translucent.NoTitleBar',
        'android:excludeFromRecents': 'true',
        'android:noHistory': 'true',
        // Not tied to Vinster's task: it lives briefly in the sharer's task.
        'android:taskAffinity': '',
      },
      'intent-filter': [{
        action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: mimeTypes.map((m) => ({ $: { 'android:mimeType': m } })),
      }],
    });
    return cfg;
  });
}

function withShareReceiverSource(config) {
  return withDangerousMod(config, ['android', async (cfg) => {
    const pkg = cfg.android?.package;
    if (!pkg) throw new Error('withShareReceiverActivity: android.package is required');
    const dir = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main/java', ...pkg.split('.'));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'ShareReceiverActivity.kt'), `package ${pkg}

import android.app.Activity
import android.content.Intent
import android.os.Bundle

// Receives Android shares and hands them straight to MainActivity in Vinster's
// own task (see plugins/withShareReceiverActivity.js for why), then closes.
class ShareReceiverActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val forward = Intent(intent).apply {
      setClass(this@ShareReceiverActivity, MainActivity::class.java)
      // Drop the sharer's "open as a new document in my window" request.
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
    }
    startActivity(forward)
    finish()
  }
}
`);
    return cfg;
  }]);
}

module.exports = function withShareReceiverActivity(config, props = {}) {
  const mimeTypes = props.mimeTypes ?? ['text/*'];
  return withShareReceiverSource(withShareReceiverManifest(config, { mimeTypes }));
};
