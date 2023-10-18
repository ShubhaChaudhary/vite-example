const path = require('path');
const buildSizes = require('build-sizes');

const reportBundleSize = async () => {
  const buildPath = path.resolve(__dirname, '../build');
  if (!buildPath) {
    console.log('Report Bundle Size: build path is incorrect. Exiting');
    process.exit(1);
  }

  const sizes = await buildSizes.getBuildSizes(buildPath);
  if (!sizes) {
    console.log(
      'Report Bundle Size: there is an error with the sizes. Exiting'
    );
    process.exit(1);
  }

  const { mainBundleName, mainBundleSize, mainBundleSizeGzip, buildSize } =
    sizes;

  // build sizes bytes in human readable format
  const formattedSizes = {
    bundleName: mainBundleName,
    buildSize: buildSizes.formatBytes(buildSize),
    bundleSize: buildSizes.formatBytes(mainBundleSize),
    gzipedSize: buildSizes.formatBytes(mainBundleSizeGzip)
  };

  console.log(formattedSizes);
};

reportBundleSize();
