import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import AttributeItem, {AttributeTypes} from 'webgme-react-components/src/components/AttributeItem';

export default class PluginConfigDialog extends Component {
    static propTypes = {
        onOK: PropTypes.func.isRequired,
        metadata: PropTypes.object.isRequired,
        fastForward: PropTypes.bool,
    };

    static defaultProps = {
        fastForward: false,
    };

    constructor(props) {
        super(props);

        const {metadata} = this.props;
        const {configStructure} = metadata;

        const {configItems} = this.state;

        configStructure.forEach((descriptor) => {
            configItems[descriptor.name] = descriptor.value;
        });
    }

    state = {
        configItems: {},
    };

    componentWillMount() {
        const {metadata, fastForward} = this.props;
        const {configStructure} = metadata;

        if (fastForward && configStructure.length === 0) {
            this.onReady();
        }
    }

    onReady = () => {
        const {configItems} = this.state;
        this.props.onOK(configItems);
    };

    onChange = (name, value) => {
        const {configItems} = this.state;
        this.setState({
            configItems: update(configItems, {
                [name]: {$set: value},
            }),
        });
    };

    render() {
        const {metadata, onOK} = this.props;
        const {configStructure} = metadata;
        const {configItems} = this.state;

        const form = configStructure.map((descriptor) => {
            const {
                name, displayName, valueItems, description, readOnly,
            } = descriptor;
            let {valueType} = descriptor;

            if (name.indexOf('color') !== -1) {
                valueType = AttributeTypes.color;
            }

            return (<AttributeItem
                fullWidth
                style={{marginBottom: 30}}
                key={name}
                value={configItems[name]}
                name={displayName}
                values={valueItems}
                type={valueType}
                onChange={(newValue) => {
                    this.onChange(name, newValue);
                }}
                description={description}
                readonly={readOnly}
            />);
        });

        return (
            <Dialog open>
                <DialogTitle>{metadata.name}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {metadata.description}
                    </DialogContentText>
                    {form}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onReady} color="primary">Run</Button>
                    <Button
                        onClick={() => {
                            onOK();
                        }}
                        color="secondary"
                    >Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
