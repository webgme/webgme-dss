import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import Console from './Console';
import Delta from 'quill-delta';

export default class ConsoleDialog extends Component {
    static propTypes = {
        onReady: PropTypes.func.isRequired
    };

    state = {
        content: 'initial content',
        delta: new Delta(),
        timerId: null
    };

    timeToChange = () => {
        // this.setState({content: this.state.content + '\nAdding some new content'});
        this.addTextToDelta('Adding new line.\n');
    };

    onReady = () => {
        clearInterval(this.state.timerId);
        this.props.onReady();
    };

    componentWillMount() {
        let timerId = setInterval(this.timeToChange, 2000);

        this.setState({timerId: timerId});
    }

    addTextToDelta = (text) => {
        const {delta} = this.state;
        let newDelta;

        // newDelta = delta.concat({ops: [{insert: 'Adding a line\n', attributes: {color: '#808000'}}]});

        newDelta = delta.concat({ops: []});
        newDelta.forEach((op) => {
            op.attributes = {color: '#586e75'};
        });

        newDelta.insert('\nAdding a new line', {color: '#808000'});
        this.setState({delta: newDelta});
    };

    render() {
        console.log(this.state.delta);
        return (
            <Dialog open={true}>
                <DialogTitle>Console Test</DialogTitle>
                <DialogContent style={{height: '500px', width: '550px'}}>
                    <Console content={this.state.delta}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onReady} color='primary'>Done</Button>
                </DialogActions>
            </Dialog>
        );
    }
};