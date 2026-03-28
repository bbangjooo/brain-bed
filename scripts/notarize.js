const { notarize } = require('@electron/notarize');
const path = require('path');

// afterSign: notarize the .app bundle
exports.notarizeApp = async function notarizeApp(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}...`);

  await notarize({
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log('App notarization complete.');
};

// afterAllArtifactBuild: notarize DMG files
exports.notarizeDmg = async function notarizeDmg(context) {
  const dmgFiles = context.artifactPaths.filter(f => f.endsWith('.dmg'));
  if (dmgFiles.length === 0) return;

  for (const dmgPath of dmgFiles) {
    console.log(`Notarizing DMG: ${dmgPath}...`);

    await notarize({
      appPath: dmgPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log(`DMG notarization complete: ${path.basename(dmgPath)}`);
  }
};
