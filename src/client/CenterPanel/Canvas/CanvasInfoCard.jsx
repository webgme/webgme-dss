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
                This is your canvas
            </Typography>
            <Typography component="p">
                Use the left menu to add components to your system. Locate which components you
                need and drag and drop them onto this Canvas. Based on their interfaces you can wire
                components together by clicking the port icons. <br/><br/>
                To set the parameter simply double-click it and the parameter editor will show up.
                From there you can click the inlined icon and it will take you to the official
                Modelica® Standard Library documentation.
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
