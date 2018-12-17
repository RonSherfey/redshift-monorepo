const fs = require('fs'),
    glob = require( 'glob' ),
    path = require( 'path' );

/**
 * Truffle does not allow you to specify the desired outputs using solc's outputSelection.
 * Instead, we will trim down the contract artifacts ourselves.
 */
glob.sync( '../contract-artifacts/**/*.json' ).forEach(relativePath => {
  const artifactPath = path.resolve(relativePath);
  let artifact = require(artifactPath);
  const { contractName, abi, bytecode, source, compiler, updatedAt } = artifact;
  artifact = {
    contractName,
    abi,
    bytecode,
    source,
    compiler,
    updatedAt
  };
  fs.writeFile(artifactPath, JSON.stringify(artifact, null, 2) + '\r\n', function (err) {
    if (err) return console.log(err);
    console.log('Writing to ' + artifactPath);
  });
});
