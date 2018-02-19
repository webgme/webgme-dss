function getObjectSorter(key, ignoreCase, reverse) {
    const multiplier = reverse ? -1 : 1;
    return (a, b) => {
        let res = 0,
            aVal = a[key],
            bVal = b[key];

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
