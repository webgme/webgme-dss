/* globals document, window */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class PortalWindow extends React.PureComponent {
    static propTypes = {
        children: PropTypes.object.isRequired,
        onClose: PropTypes.func,
        windowFeatures: PropTypes.object,
    };

    static defaultProps = {
        onClose: () => {},
        windowFeatures: {
            width: 800,
            height: 600,
            left: 200,
            top: 200,
        },
    }

    constructor(props) {
        super(props);
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
    }

    componentDidMount() {
        // STEP 3: open a new browser window and store a reference to it

        const {windowFeatures} = this.props;

        // 'width=800,height=400,left=200,top=200'
        const wfStr = Object.keys(windowFeatures).map(key => `${key}=${windowFeatures[key]}`).join(',');

        this.externalWindow = window.open('', '', wfStr);

        this.externalWindow.onbeforeunload = () => {
            this.props.onClose();
        };

        // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
        this.externalWindow.document.body.appendChild(this.containerEl);
    }

    componentWillUnmount() {
        // STEP 5: This will fire when this.state.showWindowPortal in the parent component becomes false
        // So we tidy up by closing the window

        // FIXME: Should we trigger here as well??
        // this.props.onClose();
        this.externalWindow.close();
    }

    render() {
        // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
        return ReactDOM.createPortal(this.props.children, this.containerEl);
    }
}
