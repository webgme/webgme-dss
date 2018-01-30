import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';

import superagent from 'superagent';

import {withStyles} from 'material-ui/styles';
import Card, {CardActions, CardContent, CardMedia} from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import {CircularProgress} from 'material-ui/Progress';
import Grid from 'material-ui/Grid';

//http://www.publicdomainpictures.net
//TODO: This should be defined elsewhere
const SEEDS = [
    {
        title: 'Electrical Analog',
        imageUrl: 'assets/DecoratorSVG/Modelica.Electrical.Analog.jpg',
        description: 'This package contains packages for analog electrical components. Including basic components ' +
        'such as resistor, capacitor, conductor, inductor, transformer, gyrator etc. ' +
        'It also includes sources and sensors.',
        infoUrl: 'http://doc.modelica.org/om/Modelica.Electrical.Analog.html',
        createData: {
            seed: 'Modelica',
            defaultName: 'ElectricalAnalog',
            domains: ['Modelica.Electrical.Analog']
        }
    },
    {
        title: 'Rotational Mechanics',
        imageUrl: 'assets/DecoratorSVG/Modelica.Mechanics.Rotational.jpg',
        description: 'Library Rotational is a free Modelica package providing 1-dimensional, rotational mechanical ' +
        'components to model in a convenient way drive trains with frictional losses.',
        infoUrl: 'http://doc.modelica.org/om/Modelica.Mechanics.Rotational.html',
        createData: {
            seed: 'Modelica',
            defaultName: 'RotationalMechanics',
            domains: ['Modelica.Mechanics.Rotational']
        }
    },
    {
        title: 'Translational Mechanics',
        imageUrl: 'assets/DecoratorSVG/Modelica.Mechanics.Translational.jpg',
        description: 'This package contains components to model 1-dimensional translational mechanical systems. ' +
        'The filled and non-filled green squares at the left and right side of a component represent mechanical ' +
        'flanges. Drawing a line between such squares means that the corresponding flanges are rigidly attached ' +
        'to each other.',
        infoUrl: 'http://doc.modelica.org/om/Modelica.Mechanics.Translational.html',
        createData: {
            seed: 'Modelica',
            defaultName: 'TranslationalMechanics',
            domains: ['Modelica.Mechanics.Translational']
        }
    },
    {
        title: 'Hybrid Domain',
        imageUrl: 'assets/DecoratorSVG/HybridDomain.jpg',
        description: 'Select a range of different domains and build your own hybrid systems. Later on you can always ' +
        'import more domains in case you can\'t decide right now.',
        infoUrl: 'http://doc.modelica.org/om/Modelica.html',
        createData: {
            seed: 'Modelica',
            defaultName: 'ModelicaHybrid',
            domains: []
        }
    }
];

const styles = theme => ({
    cardContent: {
        minHeight: 160
    },
    media: {
        height: 120,
    },
    progress: {
        margin: `0 ${theme.spacing.unit * 2}px`,
    }
});

class CreateProject extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projects: PropTypes.array,
        classes: PropTypes.object.isRequired
    };

    createNew(createData) {

        let path = [
            this.props.gmeClient.gmeConfig.rest.components.DomainManager.mount,
            'createProject',
            createData.defaultName  // TODO: we should prompt for a name
        ].join('/');

        superagent.post(path)
            .send(createData)
            .end((err, result) => {
                if (err) {
                    // TODO: we need to show these errors
                    console.error(err);
                } else {
                    console.log(result);
                    const [owner, name] = result.body.projectId.split('+');
                    this.props.history.push(`/p/${owner}/${name}`);
                }
            });
    }

    render() {
        const {projects, classes} = this.props;

        let cards = SEEDS.map(seedInfo => {
            let buttons = [];
            if (projects) {
                buttons.push(<Button key="createBtn" dense color="primary" onClick={() => {
                    this.createNew(seedInfo.createData)
                }}>
                    Create
                </Button>);

                if (seedInfo.infoUrl) {
                    buttons.push(<Button key="infoBtn" dense color="primary" component={Link} to={seedInfo.infoUrl}
                                         target="_blank">
                        Learn More
                    </Button>);
                }
            } else {
                buttons.push(<CircularProgress key="progress" className={classes.progress}/>);
            }

            return (
                <Grid item lg={6} key={seedInfo.title}>
                    <Card>
                        <CardMedia
                            className={classes.media}
                            image={seedInfo.imageUrl}
                            title={seedInfo.title}
                        />
                        <CardContent className={classes.cardContent}>
                            <Typography type="headline" component="h2">
                                {seedInfo.title}
                            </Typography>
                            <Typography component="p">
                                {seedInfo.description}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            {buttons}
                        </CardActions>
                    </Card>
                </Grid>
            );
        });

        return (
            <div>
                <Grid container spacing={24}>
                    {cards}
                </Grid>
            </div>
        );
    }
}


export default withRouter(withStyles(styles)(CreateProject));