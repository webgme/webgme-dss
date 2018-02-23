import {Component} from 'react';
import PropTypes from 'prop-types';

export default class Territory extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        territory: PropTypes.object,
        onUpdate: PropTypes.func,
        onlyActualEvents: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        territory: null,
        onUpdate: null,
    };


    componentDidMount() {
        const {
            gmeClient, territory, onUpdate, onlyActualEvents,
        } = this.props;

        this.uiId = gmeClient.addUI(null, (events) => {
            const load = [];
            const update = [];
            const unload = [];
            const hash = gmeClient.getActiveRootHash();

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
                    // technical event, do not care
                }
            });

            if (onUpdate && (!onlyActualEvents || load.length > 0 || update.length > 0 || unload.length > 0)) {
                onUpdate(hash, load, update, unload);
            }
        });

        if (territory) {
            gmeClient.updateTerritory(this.uiId, territory);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {gmeClient} = nextProps;
        const {territory} = this.props;

        if (JSON.stringify(territory) !== JSON.stringify(nextProps.territory)) {
            gmeClient.updateTerritory(this.uiId, nextProps.territory || {});
        }
    }

    componentWillUnmount() {
        const {gmeClient} = this.props;

        gmeClient.removeUI(this.uiId);
    }

    uiId = null;

    render() {
        return null;
    }
}
