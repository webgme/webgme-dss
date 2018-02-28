/* globals document */
import blockies from 'blockies';

export default (userId) => {
    let icon;

    if (userId) {
        icon = blockies({ // All options are optional
            seed: userId, // seed used to generate icon data, default: random
            // color: '#dfe', // to manually specify the icon color, default: random
            // bgcolor: '#aaa', // choose a different background color, default: random
            size: 6, // width/height of the icon in blocks, default: 8
            scale: 8, // width/height of each block in pixels, default: 4
            // spotcolor: '#000' // each pixel has a 13% chance of being of a third color,
            // default: random. Set to -1 to disable it. These "spots" create structures
            // that look like eyes, mouths and noses.
        });
    } else {
        icon = document.createElement('canvas');
        icon.width = 6 * 8;
        icon.height = icon.width;
    }

    return icon.toDataURL();
};
