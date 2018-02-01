/**
 *
 * @param {string} name
 * @param {string[]} currentNames
 * @returns {string}
 */
function getIndexedName(name, currentNames) {
    let indices = currentNames
        .filter(n => {
            return n.startsWith(name);
        })
        .map(n => {
            let indexStr = n.substring(name.length);
            if (indexStr === '') {
                return 0;
            } else {
                return parseInt(indexStr, 10);
            }
        })
        .filter(index => {
            return isNaN(index) === false;
        });

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