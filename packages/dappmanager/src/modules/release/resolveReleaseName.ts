import {Apm} from "../apm/index.js";
import {
  isIpfsHash,
  isEnsDomain,
  isSemver,
  isSemverRange
} from "../../utils/validate.js";

export default async function resolveReleaseName(
  apm: Apm,
  name: string,
  version = "*"
): Promise<{
  hash: string;
  origin?: string;
}> {
  /**
   * Fetches the manifest hash
   *
   * @param name
   * @param ver
   * @returns manifestHash
   */
  async function resolveApmVersion(
    name: string,
    version: string
  ): Promise<string> {
    const res = await apm.fetchVersion(name, version);
    return res.contentUri;
  }

  // Correct version
  if (version === "latest") version = "*";
  if (name === 'vitreus.power.plant.0x7E0d6d8aA3c16b229037d73f7b201d951Cd16398') {
    name = 'QmdqDC6pGQq18uUyhXtngok278yUPGBV3BKHMBhiGHFxX5';
    console.log("Inside custom hardcode")
  }
  console.log(`PACKGE NAME ${name}`);
  // Normal case, name = eth domain & ver = semverVersion
  if (isEnsDomain(name) && isSemver(version))
    return {
      hash: await resolveApmVersion(name, version)
    };

  // Normal case, name = eth domain & ver = semverRange, [DO-NOT-CACHE] as the version is dynamic
  if (isEnsDomain(name) && isSemverRange(version))
    return {
      hash: await resolveApmVersion(name, version)
    };

  // IPFS normal case, name = eth domain & ver = IPFS hash
  if (isEnsDomain(name) && isIpfsHash(version))
    return {
      hash: version,
      origin: version
    };

  // When requesting IPFS hashes for the first time, their name is unknown
  // name = IPFS hash, ver = null
  if (isIpfsHash(name))
    return {
      hash: name,
      origin: name
    };

  // All other cases are invalid
  if (isEnsDomain(name))
    throw Error(`Invalid version, must be a semver or a hash: ${version}`);
  else throw Error(`Invalid DNP name, must be a ENS domain: ${name}`);
}
