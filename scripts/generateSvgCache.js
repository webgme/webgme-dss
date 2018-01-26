/**
 * @author kecso / https://github.com/kecso
 */
const fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser();

function getPortDescription(portJson) {
    let boundingBox = {id: portJson.$.id || '', x: 0, y: 0, height: 0, width: 0};

    if (portJson.rect) {
        let rect = portJson.rect;
        if (rect.length)
            rect = rect[0];

        boundingBox.x = Number(rect.$.x);
        boundingBox.y = Number(rect.$.y);
        boundingBox.height = Number(rect.$.height);
        boundingBox.width = Number(rect.$.width);
    } else if (portJson.ellipse) {
        let ellipse = portJson.ellipse;
        if (ellipse.length) {
            ellipse = ellipse[0];
        }

        boundingBox.x = Number(ellipse.$.cx) - Number(ellipse.$.rx);
        boundingBox.y = Number(ellipse.$.cy) - Number(ellipse.$.ry);
        boundingBox.width = Number(ellipse.$.rx * 2);
        boundingBox.height = Number(ellipse.$.ry * 2);
    } else if (portJson.polygon) {
        let polygon = portJson.polygon,
            coordinates, minX, minY, maxX, maxY;
        if (polygon.length)
            polygon = polygon[0];

        coordinates = polygon.$.points.split(' ');
        coordinates.forEach((strCoordinate) => {
            let xy = strCoordinate.split(',');
            if (minX === undefined || minX > Number(xy[0]))
                minX = Number(xy[0]);
            if (minY === undefined || minY > Number(xy[1]))
                minY = Number(xy[1]);
            if (maxX === undefined || maxX < Number(xy[0]))
                maxX = Number(xy[0]);
            if (maxY === undefined || maxY < Number(xy[1]))
                maxY = Number(xy[1]);
        });

        boundingBox.x = minX;
        boundingBox.y = minY;
        boundingBox.width = maxX - minX;
        boundingBox.height = maxY - minY;
    }

    return boundingBox;
}

function getTemplate(jsonTextItem) {
    const matchPattern = /\%\w+/g;
    let template;

    (jsonTextItem.tspan || []).forEach((tspan) => {
        if (tspan.$.class === 'data-bind') {
            template = tspan._;
        }
    });

    if (template) {
        //TODO could it be more match???
        let match = matchPattern.exec(template),
            attributeName;
        if (match)
            match = match[0];

        if (match) {
            attributeName = match.substr(1);
            template = template.replace(match, '<%=getAttribute("' + attributeName + '")%>');
        } else {
            template = '';
        }
    } else {
        template = jsonTextItem._;
    }

    return template;
}

function getParsedSvg(rawJsonSvg) {
    let svg = {ports: {}, template: ''},
        gItems,
        builder = new xml2js.Builder();
    if (rawJsonSvg.g === undefined) {
        gItems = [];
    } else if (rawJsonSvg.g.length) {
        gItems = rawJsonSvg.g;
    } else {
        gItems = [rawJsonSvg.g];
    }
    gItems.forEach((portJson) => {
        let portDescription = getPortDescription(portJson);
        svg.ports[portDescription.id] = portDescription;
    });

    if (rawJsonSvg.text !== undefined)
        if (rawJsonSvg.text.length) {
            rawJsonSvg.text.forEach((textItem, index) => {
                rawJsonSvg.text[index]._ = ' ' + getTemplate(textItem);
            });
        } else {
            rawJsonSvg.text._ = getTemplate(rawJsonSvg.text);
        }
    try {
        svg.template = builder.buildObject(rawJsonSvg).replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    } catch (e) {
        console.log(e);
        svg = null;
    }
    return svg;
}

function writeResultOut(svgCache) {
    fs.writeFileSync(path.join(__dirname, './../src/svgcache.json'), JSON.stringify(svgCache, null, 2), 'utf8');
}

const dirpath = path.join(__dirname, './../public/assets/DecoratorSVG');
let filenames = fs.readdirSync(dirpath, 'utf8'),
    cache = {},
    count = filenames.length;

filenames.forEach((filename) => {
    if (path.extname(filename) === '.svg') {
        let id = path.basename(filename, '.svg');
        parser.parseString(fs.readFileSync(path.join(dirpath, '/' + filename), 'utf8'), (err, resultObj) => {
            console.log('processing - ', filename);
            if (err) {
                console.log(err);
            } else {
                cache[id] = getParsedSvg(resultObj.svg);
            }
            if (--count === 0)
                writeResultOut(cache);
        });
    } else {
        if (--count === 0)
            writeResultOut(cache);
    }
});