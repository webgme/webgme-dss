import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Z_LEVELS from '../../gme/utils/zLevels';

export default class BasicConnection extends Component {
    static propTypes = {
        path: PropTypes.arrayOf(PropTypes.object).isRequired,
        onClick: PropTypes.func,
        hasWrapper: PropTypes.bool.isRequired,
        dashed: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        onClick: null,
    };

    onClick = (event) => {
        const {onClick} = this.props;
        if (onClick) {
            onClick(event);
        }
    };

    getBoundingBox = () => {
        const {path} = this.props;
        let minX;
        let maxX;
        let minY;
        let maxY;

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
            width: Math.max(maxX - minX, 2),
            height: Math.max(maxY - minY, 2),
        };
    };

    render() {
        const {path, hasWrapper, dashed} = this.props;
        const box = this.getBoundingBox();
        const sections = [];
        let i;
        const style = hasWrapper ? {} : {
            position: 'absolute',
            top: box.y,
            left: box.x,
            zIndex: Z_LEVELS.connection,
        };

        if (box === null) {
            return null;
        }

        for (i = 0; i < path.length - 1; i += 1) {
            sections.push(<path
                key={i}
                d={`M${
                    path[i].x} ${
                    path[i].y} L${
                    path[i + 1].x} ${
                    path[i + 1].y}`}
                strokeWidth={1}
                strokeDasharray={dashed ? 5 : 0}
                stroke="black"
            />);
        }

        return (
            <svg
                width={box.width}
                height={box.height}
                style={style}
                viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
            >
                {sections}
            </svg>);
    }
}
