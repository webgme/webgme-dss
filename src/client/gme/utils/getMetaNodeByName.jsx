/**
 * Returns the meta-node that matches the given name.
 * Return undefined in match
 * @param {object} gmeClient
 * @param {string} name
 * @returns {GMENode|undefined} The first meta-node that matches the name.
 */
export default function (gmeClient, name) {
    const metaNodes = gmeClient.getAllMetaNodes();
    for (let i = 0; i < metaNodes.length; i += 1) {
        if (metaNodes[i].getAttribute('name') === name) {
            return metaNodes[i];
        }
    }

    return undefined;
}
