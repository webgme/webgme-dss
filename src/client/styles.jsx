import {LAYOUT_SIZES} from './CONSTANTS';

export const appHeader = {
    minHeight: LAYOUT_SIZES.HEADER_HEIGHT,
};

export function centerPanel(leftDrawerOpen) {
    const leftMargin = leftDrawerOpen ? LAYOUT_SIZES.SIDE_PANEL_WIDTH : LAYOUT_SIZES.SIDE_PANEL_WIDTH_MINIMIZED;
    return {
        top: LAYOUT_SIZES.HEADER_HEIGHT,
        left: leftMargin,
        width: `calc(100% - ${leftMargin}px)`,
        height: `calc(100% - ${LAYOUT_SIZES.HEADER_HEIGHT}px)`,
        position: 'fixed',
    };
}

/*
export const splitPanel = {
    top: LAYOUT_SIZES.HEADER_HEIGHT,
    left: LAYOUT_SIZES.SIDE_PANEL_WIDTH_MINIMIZED,
    width: '100%',
    height: '100vh',
    position: 'fixed',
    overflow: 'auto'
};
*/
