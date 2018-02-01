import {LAYOUT_SIZES} from "./CONSTANTS";

export const sideDrawer = {
    drawerPaper: {
        width: LAYOUT_SIZES.SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: LAYOUT_SIZES.HEADER_HEIGHT
    },
    drawerPaperClose: {
        width: LAYOUT_SIZES.SIDE_PANEL_WIDTH_MINIMIZED,
        overflowX: 'hidden'
    }
};