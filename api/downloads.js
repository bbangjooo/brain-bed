export default async function handler(req, res) {
  const response = await fetch('https://api.github.com/repos/bbangjooo/brain-bed/releases', {
    headers: { 'User-Agent': 'brain-bed-badge' },
  });
  const releases = await response.json();

  let total = 0;
  for (const release of releases) {
    for (const asset of release.assets || []) {
      if (asset.name.endsWith('.dmg') && !asset.name.includes('blockmap')) {
        total += asset.download_count;
      }
    }
  }

  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json({
    schemaVersion: 1,
    label: 'Downloads',
    message: `${total}`,
    color: 'blue',
  });
}
