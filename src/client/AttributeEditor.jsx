import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Switch from 'material-ui/Switch';
import List, {
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Input, {InputLabel, InputAdornment} from 'material-ui/Input';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';

export class LabelItem extends Component {
    constructor(props) {
        super(props);

    }

    onChange() {

    }

    render() {
        return (
            <TextField
                label={this.props.name}
                value={this.props.value}
                disabled={true} //TODO show that later we might want to have options here
                fullWidth={true}
            />
        );
    }
}

LabelItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
};

export class EnumItem extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <TextField
                select
                label={this.props.name}
                value={this.props.value}
                onChange={this.props.onChange}
                SelectProps={{native: true}}
                disabled={false} //TODO show that later we might want to have options here
                fullWidth={true}
            >
                {this.props.values.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </TextField>
        );
    }
}

EnumItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};

// export class BooleanItem extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {value: props.value};
//
//         this.onToggle = this.onToggle.bind(this);
//     }
//
//     onToggle() {
//         let value = this.state.value ? false : true;
//         this.props.onChange(value);
//         this.setState({value: value});
//     }
//
//     render() {
//         return (
//             <ListItem>
//                 <ListItemText primary={this.props.name}/>
//                 <ListItemSecondaryAction>
//                     <Switch
//                         onChange={this.onToggle}
//                         checked={this.state.value}
//                     />
//                 </ListItemSecondaryAction>
//             </ListItem>
//         );
//     }
// }
export class BooleanItem extends Component {
    constructor(props) {
        super(props);

        this.onSelection = this.onSelection.bind(this);
    }

    onSelection(event) {
        console.log('whaaat', event);
    }

    render() {
        return (
            <TextField
                select
                label={this.props.name}
                value={this.props.value}
                onChange={this.onSelection}
                SelectProps={{native: true}}
                disabled={false} //TODO show that later we might want to have options here
                fullWidth={true}
            >
                <option key={true} value={true}>true</option>
                <option key={false} value={false}>false</option>
            </TextField>
        );
    }
}

BooleanItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

export class StringItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: undefined
        };
    }

    render() {
        return (
            <ListItem/>
        );
    }
}

StringItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default class AttributeEditor extends SingleConnectedNode {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            attributes: []
        };

        this.onNodeLoad = this.refreshDescriptor;
        this.onNodeUpdate = this.refreshDescriptor;
    }

    refreshDescriptor() {
        let nodeObj = this.props.gmeClient.getNode(this.props.activeNode),
            names = nodeObj.getValidAttributeNames(),
            attributes;

        // All children are meta-nodes -> thus available right away
        attributes = names.map((id) => {
            return {
                name: id,
                value: nodeObj.getAttribute(id),
                type: nodeObj.getAttributeMeta(id).type || 'string',
                enum: nodeObj.getAttributeMeta(id).enum || null
            };
        });

        this.setState({
            loaded: true,
            attributes: attributes
        });
    }

    somethingChanges(what, how) {
        console.log('update root:', what, ':', how);
    }

    render() {
        let attributes = [];
        if (!this.state.loaded) {
            return (<div>Loading node in Attribute Editor ...</div>);
        }

        attributes = this.state.attributes.map((attribute) => {
            if (attribute.enum !== null) {
                return (<EnumItem name={attribute.name} value={attribute.value} values={attribute.enum}
                                  onChange={(newValue) => {
                                      this.somethingChanges(attribute.name, newValue);
                                  }}/>);
            } else if (attribute.type === 'bool') {
                return <BooleanItem name={attribute.name} value={attribute.value} onChange={(newValue) => {
                    this.somethingChanges(attribute.name, newValue);
                }}/>
            }
            return <LabelItem name={attribute.name} value={'' + attribute.value}/>;
        });

        return (
            <div>
                <List dense={true}>
                    {attributes}
                </List>
            </div>
        );
    }
}

AttributeEditor.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};