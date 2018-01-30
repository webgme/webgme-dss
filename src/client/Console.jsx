import React, {Component} from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';

import './Console.css';

export default class Console extends Component {
    static propTypes = {
        content: PropTypes.object.isRequired
    };

    render() {
        let {content} = this.props;
        return (<ReactQuill
            style={{
                backgroundColor: '#002b36',
                color: '#586e75',
                fontSize: '12px',
                fontFamily: 'monospace'
            }}
            theme={null}
            value={content}
            readOnly={true}/>);
    }
}