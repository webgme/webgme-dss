import {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Base class that defines a territory for a single node.
 * Use this as base if your component is only interested in the node itself
 * (not any children or other custom territories).
 */
export default class Territory extends Component {
    static propTypes = {
        activeNode: PropTypes.string.isRequired,
        gmeClient: PropTypes.object.isRequired,
        territory: PropTypes.object.isRequired,
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

        gmeClient.updateTerritory(this.uiId, territory);
    }

    componentWillReceiveProps(newProps) {
        const {gmeClient} = newProps,
            {territory} = this.props;
        if (JSON.stringify(territory) !== JSON.stringify(newProps.territory)) {
            gmeClient.updateTerritory(this.uiId, newProps.territory);
        }
    }

    componentWillUnmount() {
        this.props.gmeClient.removeUI(this.uiId);
    }

    render() {
        return null;
    }
}