import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class PartBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    render() {
        if (!this.state.loaded) {
            return (<div>Loading node in Part Browser ...</div>);
        }

        return (
            <div>
                Hello there from Part Browser ...
            </div>
        );
    }
}

PartBrowser.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};