import React from 'react';
import {Link} from 'react-router-dom';

import Card, {CardActions, CardContent} from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

const CanvasInfoCard = () => (
    <Card style={{
        position: 'absolute',
        maxWidth: 600,
        left: 'calc(50% - 300px)',
        top: '20%',
    }}
    >
        <CardContent>
            <Typography style={{marginBottom: 20}} variant="headline" component="h2">
                Simulation Results
            </Typography>
            <Typography component="p">
                Use the left menu to view any of your currently and previously executed simulations.
                If you do not have any stored results - there is not much to do in here...
                <br/><br/>
                The time series in Modelica® are organized in a tree structure based on the name of the components
                and variables within. If you have any successful simulation results stored
                you can navigate the tree structure and select which variables to plot.
            </Typography>
        </CardContent>
        <CardActions>
            <Button
                size="small"
                color="primary"
                component={Link}
                to="http://doc.modelica.org/om/Modelica.html"
                target="_blank"
            >
                Learn More About Modelica
            </Button>
        </CardActions>
    </Card>
);

export default CanvasInfoCard;
