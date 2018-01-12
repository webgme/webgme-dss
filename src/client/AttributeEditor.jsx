import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class AttributeEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    render() {
        if (!this.state.loaded) {
            return (<div>Loading node in Attribute Editor ...</div>);
        }

        return (
            <div>
                Hello there from Attribute Editor!
            </div>
        );
    }
}

AttributeEditor.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};