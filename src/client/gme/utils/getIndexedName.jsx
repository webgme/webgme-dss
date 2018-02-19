/**
 *
 * @param {string} name
 * @param {string[]} currentNames
 * @returns {string}
 */
function getIndexedName(name, currentNames) {
    const indices = currentNames
        .filter(n => n.startsWith(name))
        .map((n) => {
            const indexStr = n.substring(name.length);
            if (indexStr === '') {
                return 0;
            }
            return parseInt(indexStr, 10);
        })
        .filter(index => isNaN(index) === false);

    if (indices.length === 0) {
        return name;
    }

    for (let i = 0; i < indices.length; i += 1) {
        if (indices.includes(i) === false) {
            if (i === 0) {
                return name;
            }

            return name + i;
        }
    }

    return name + indices.length;
}

export default getIndexedName;
