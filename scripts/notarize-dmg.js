const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizeDmg(context) {
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
