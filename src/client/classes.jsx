import {LAYOUT_SIZES} from './CONSTANTS';

const sideDrawer = {
    drawerPaper: {
        width: LAYOUT_SIZES.SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: LAYOUT_SIZES.HEADER_HEIGHT,
        height: `calc(100vh - ${LAYOUT_SIZES.HEADER_HEIGHT}px)`,
    },
    drawerPaperClose: {
        width: LAYOUT_SIZES.SIDE_PANEL_WIDTH_MINIMIZED,
        overflowX: 'hidden',
    },
};

export default sideDrawer;
