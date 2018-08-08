import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Input, {InputAdornment} from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import InvertColors from '@material-ui/icons/InvertColors';
import InvertColorsOff from '@material-ui/icons/InvertColorsOff';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import {GithubPicker} from 'react-color';

export const AttributeTypes = {
    string: 'string',
    number: 'number',
    color: 'color',
    boolean: 'boolean',
    asset: 'asset',
};

export default class AttributeItem extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        onFullChange: PropTypes.func,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
        ]).isRequired,
        values: PropTypes.arrayOf(PropTypes.string),
        readonly: PropTypes.bool,
        style: PropTypes.object,
        fullWidth: PropTypes.bool,
        noTriggerOnBlur: PropTypes.bool,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        unit: PropTypes.string,
        type: PropTypes.string.isRequired,
        invalidChars: PropTypes.object,
    };

    static defaultProps = {
        onChange: () => {
        },
        onFullChange: () => {
        },
        values: null,
        description: null,
        unit: null,
        style: null,
        fullWidth: false,
        readonly: false,
        noTriggerOnBlur: false,
        invalidChars: null,
    }

    state = {
        value: this.props.value,
        picking: false,
    };

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value, picking: false});
    }

    onColorChange = (color) => {
        const {value} = this.props;

        if (color.hex !== value) {
            this.props.onChange(color.hex);
            this.props.onFullChange(color.hex);

            this.setState({value: color.hex, picking: false});
        }

        this.setState({picking: false});
    };

    onChange = (event) => {
        const {
            type, value, values,
        } = this.props;

        const newValue = this.eventToAttrValue(event);

        switch (type) {
            case AttributeTypes.boolean:
                this.props.onChange(newValue);
                this.props.onFullChange(newValue);
                this.setState({value: newValue});
                break;
            case AttributeTypes.string:
            case AttributeTypes.asset:
                if (newValue !== value) {
                    this.props.onChange(newValue);

                    if (values && values.length > 0) {
                        this.props.onFullChange(newValue);
                    }
                }

                this.setState({value: newValue});
                break;
            case AttributeTypes.number:
                if (newValue !== value) {
                    this.props.onChange(newValue);

                    if (values && values.length > 0) {
                        this.props.onFullChange(newValue);
                    }
                }

                this.setState({value: newValue});
                break;
            default:
                break;
        }
    };

    onKeyPress = (event) => {
        const newValue = this.eventToAttrValue(event);

        if (this.props.type !== AttributeTypes.color) {
            if (event.charCode === 13 && newValue !== this.props.value) {
                this.props.onFullChange(newValue);
            }

            this.setState({value: newValue});
        }
    };

    onFocus = () => {
        if (this.props.type === AttributeTypes.color) {
            this.setState({picking: true});
        }
    };

    onBlur = (event) => {
        const newValue = this.eventToAttrValue(event);
        const {type, value, noTriggerOnBlur} = this.props;

        if (type !== AttributeTypes.color) {
            if (!noTriggerOnBlur && newValue !== value) {
                this.props.onFullChange(newValue);
            }

            this.setState({value: newValue});
        }
    };

    getContent = () => {
        const {type, values, readonly} = this.props;
        const {value, picking} = this.state;

        if (values && values.length > 0) {
            // enum case
            return (
                <Select disabled={readonly} native value={value} onChange={this.onChange}>
                    {values.map(option => (<option key={option}>{option}</option>))}
                </Select>);
        }

        let content;

        switch (type) {
            case AttributeTypes.boolean:
                content = (<FormControlLabel
                    disabled={readonly}
                    control={<Switch checked={value} onChange={this.onChange}/>}
                />);
                break;
            case AttributeTypes.string:
                content = (<Input
                    disabled={readonly}
                    value={value}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.onBlur}
                />);
                break;
            case AttributeTypes.number:
                content = (<Input
                    disabled={readonly}
                    type="number"
                    value={value}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.onBlur}
                />);
                break;
            case AttributeTypes.color:
                content = [];
                content.push(<Input
                    key="input"
                    value={this.state.value}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => {
                                this.setState({picking: !picking});
                            }}
                            >
                                {picking ? <InvertColorsOff/> : <InvertColors nativeColor={value}/>}
                            </IconButton>
                        </InputAdornment>
                    }
                />);

                if (picking) {
                    content.push(<GithubPicker
                        key="picker"
                        color={this.state.value}
                        onChange={this.onColorChange}
                    />);
                }

                break;
            default:
                content = null;
        }

        return content;
    };

    eventToAttrValue = (event) => {
        const {type, invalidChars} = this.props;

        switch (type) {
            case AttributeTypes.boolean:
                return event.target.checked;
            case AttributeTypes.string:
                if (invalidChars instanceof RegExp) {
                    return event.target.value.replace(invalidChars, '');
                }

                return event.target.value;
            case AttributeTypes.asset:
                return event.target.value;
            case AttributeTypes.number:
                return Number(event.target.value);
            default:
                return null;
        }
    };

    render() {
        const content = this.getContent();

        return (
            <FormControl
                style={this.props.style || {}}
                fullWidth={this.props.fullWidth}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
            >
                <FormLabel>{this.props.unit ? `${this.props.name} [${this.props.unit}]` : this.props.name}</FormLabel>
                {content}
                <FormHelperText>{this.props.description}</FormHelperText>
            </FormControl>);
    }
}
