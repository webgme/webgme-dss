import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';

export default class CheckboxList extends React.PureComponent {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            isChecked: PropTypes.bool,
            label: PropTypes.string,
            cbStyle: PropTypes.object,
        })).isRequired,
        onCheckedChange: PropTypes.func.isRequired, // item.id, event, checked
        title: PropTypes.string,
        helperText: PropTypes.string,
    };

    static defaultProps = {
        title: '',
        helperText: '',
    }

    render() {
        const {items, title, helperText} = this.props;

        return (
            <FormControl component="fieldset">
                <FormLabel component="legend">{title}</FormLabel>
                <FormGroup>
                    {items.map(item => (
                        <FormControlLabel
                            key={item.id}
                            control={
                                <Checkbox
                                    style={item.cbStyle || {}}
                                    checked={!!item.isChecked}
                                    onChange={(event, checked) => {
                                        this.props.onCheckedChange(item.id, event, checked);
                                    }}
                                    value={item.id}
                                />
                            }
                            label={typeof item.label === 'string' ? item.label : item.id}
                        />))}
                </FormGroup>
                <FormHelperText>{helperText}</FormHelperText>
            </FormControl>);
    }
}
