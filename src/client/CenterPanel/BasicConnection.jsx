import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class BasicConnection extends Component {
    static propTypes = {
        path: PropTypes.array.isRequired,
        onClick: PropTypes.func
    };

    onClick = (event) => {
        if (this.props.onClick) {
            this.props.onClick(event);
        }
    };

    getBoundingBox = () => {
        let {path} = this.props,
            minX, maxX, minY, maxY;

        if (path.length === 0) {
            return null;
        }
        minX = path[0].x;
        maxX = path[0].x;
        minY = path[0].y;
        maxY = path[0].y;

        path.forEach((point) => {
            if (point.x < minX) {
                minX = point.x;
            }

            if (point.x > maxX) {
                maxX = point.x;
            }

            if (point.y < minY) {
                minY = point.y;
            }

            if (point.y > maxY) {
                maxY = point.y;
            }
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };

    render() {
        const {path} = this.props;
        let box = this.getBoundingBox(),
            sections = [], i;

        if (box === null) {
            return null;
        }

        for (i = 0; i < path.length - 1; i += 1) {
            sections.push(<path
                key={i}
                d={'M' +
                (path[i].x) + ' ' +
                (path[i].y) + ' L' +
                (path[i + 1].x) + ' ' +
                (path[i + 1].y)}
                strokeWidth={1}
                stroke={'black'}/>)
        }

        return (<svg
            width={box.width}
            height={box.height}
            style={{position: 'absolute', top: box.y, left: box.x}}
            viewBox={box.x + ' ' + box.y + ' ' + box.width + ' ' + box.height}>
            {sections}
        </svg>);
    }

}