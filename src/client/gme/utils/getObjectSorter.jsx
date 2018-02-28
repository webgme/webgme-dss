function getObjectSorter(keyOrKeys, ignoreCase, reverse) {
    const multiplier = reverse ? -1 : 1;
    const keys = typeof keyOrKeys === 'string' ? [keyOrKeys] : keyOrKeys;

    return (a, b) => {
        let res = 0;

        let aVal = a;
        let bVal = b;

        keys.forEach((key) => {
            aVal = aVal[key];
            bVal = bVal[key];
        });

        if (ignoreCase) {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal > bVal) {
            res = 1;
        } else if (aVal < bVal) {
            res = -1;
        }

        return res * multiplier;
    };
}

const nameSort = getObjectSorter('name', true);

export default getObjectSorter;

export {
    nameSort,
};
