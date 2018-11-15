import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {Samy} from 'react-samy-svg';

import SVGCACHE from '../../plugins/MoveSVGToRegistryUtil/svgcache.json';

const SCALE = 0.6;

export default class AttributeEditorIcon extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        nodeId: PropTypes.string,
    };

    static defaultProps = {
        nodeId: null,
    };

    getSvgAttributeParts = (node) => {
        const svgAttrs = SVGCACHE[node.getAttribute('ModelicaURI')].attributes;

        return Object.keys(svgAttrs).map((attrName) => {
            const attrDesc = svgAttrs[attrName];
            const viewBox = `${attrDesc.bbox.x * SCALE} ${attrDesc.bbox.y * SCALE}
                ${(attrDesc.bbox.x + attrDesc.bbox.width) * SCALE}
                ${(attrDesc.bbox.y + attrDesc.bbox.height) * SCALE}`;

            return (
                <svg
                    key={attrName}
                    style={{
                        position: 'absolute',
                        top: attrDesc.bbox.y * SCALE,
                        left: attrDesc.bbox.x * SCALE,
                    }}
                    viewBox={viewBox}
                >
                    <text
                        x={(attrDesc.parameters.x || 0) * SCALE}
                        y={(attrDesc.parameters.y || 0) * SCALE}
                        alignmentBaseline={attrDesc.parameters['alignment-baseline'] || 'middle'}
                        fill={attrDesc.parameters.fill || 'rgb(0,0,255)'}
                        fontFamily={attrDesc.parameters['font-family'] || 'Veranda'}
                        fontSize={Number(attrDesc.parameters['font-size'] || '18') * SCALE}
                        textAnchor={attrDesc.parameters['text-anchor'] || 'middle'}
                    >
                        {attrDesc.text.substring(0, attrDesc.position) +
                        node.getAttribute(attrName) +
                        attrDesc.text.substring(attrDesc.position)}
                    </text>
                </svg>);
        });
    };

    render() {
        const {gmeClient, nodeId} = this.props;
        const node = gmeClient.getNode(nodeId);
        const modelicaUri = node && node.getAttribute('ModelicaURI');

        if (!modelicaUri) {
            return null;
        }

        const {bbox, base} = SVGCACHE[modelicaUri];

        return (
            <a
                href={`http://doc.modelica.org/om/${modelicaUri}.html`}
                target="_blank"
                style={{textDecoration: 'none'}}
            >
                <Typography style={{fontSize: 10, color: 'rgba(0, 0, 0, 0.54)'}}>
                    {modelicaUri.substr('Modelica.'.length)}
                </Typography>
                <div style={{
                    height: bbox.height * SCALE,
                    width: bbox.width * SCALE,
                    position: 'relative',
                    display: 'inline-flex',
                }}
                >
                    <Samy svgXML={base} style={{height: bbox.height * SCALE, width: bbox.width * SCALE}}/>
                    {this.getSvgAttributeParts(node)}
                </div>
            </a>
        );
    }
}
