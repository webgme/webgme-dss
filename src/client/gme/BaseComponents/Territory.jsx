import {Component} from 'react';
import PropTypes from 'prop-types';

export default class Territory extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        territory: PropTypes.object,
        onUpdate: PropTypes.func,
        onlyActualEvents: PropTypes.bool.isRequired
    };

    uiId = null;

    componentDidMount() {
        const {gmeClient, territory, onUpdate, onlyActualEvents} = this.props;

        this.uiId = gmeClient.addUI(null, (events) => {
            let load = [], update = [], unload = [], hash;

            events.forEach((event) => {
                switch (event.etype) {
                    case 'load':
                        load.push(event.eid);
                        break;
                    case 'update':
                        update.push(event.eid);
                        break;
                    case 'unload':
                        unload.push(event.eid);
                        break;
                    default:
                    //technical event, do not care
                }
            });
            hash = gmeClient.getNode('').getId();
            if (onUpdate && (!onlyActualEvents || load.length > 0 || update.length > 0 || unload.length > 0)) {
                onUpdate(hash, load, update, unload);
            }
        });

        if (territory) {
            gmeClient.updateTerritory(this.uiId, territory);
        }
    }

    componentWillReceiveProps(newProps) {
        const {gmeClient} = newProps,
            {territory} = this.props;

        if (JSON.stringify(territory) !== JSON.stringify(newProps.territory)) {
            gmeClient.updateTerritory(this.uiId, newProps.territory || {});
        }
    }

    componentWillUnmount() {
        this.props.gmeClient.removeUI(this.uiId);
    }

    render() {
        return null;
    }
}