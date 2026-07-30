// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SheetJS (`xlsx`, used to import Excel cellar spreadsheets) statically
// references Node core modules (`stream`, `fs`) behind runtime guards. Metro
// resolves every require('literal') at bundle time regardless of those guards,
// so without this it fails with "Unable to resolve module stream". We only ever
// hand XLSX base64 (XLSX.read(..., { type: 'base64' })), so the Node file/stream
// paths never run — map them to an empty module, and only for xlsx so nothing
// else is affected.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    (moduleName === 'stream' || moduleName === 'fs') &&
    context.originModulePath &&
    context.originModulePath.includes(`${require('path').sep}node_modules${require('path').sep}xlsx${require('path').sep}`)
  ) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// The web Journal (web/journal) is a standalone Astro project. If it's ever
// `npm install`ed locally, keep Metro from crawling its node_modules — that
// would cause Haste "duplicate module" collisions against the app's own deps.
const journalBlock = /web[\\/]journal[\\/].*/;
config.resolver.blockList = config.resolver.blockList
  ? (Array.isArray(config.resolver.blockList)
      ? [...config.resolver.blockList, journalBlock]
      : [config.resolver.blockList, journalBlock])
  : journalBlock;

module.exports = config;
