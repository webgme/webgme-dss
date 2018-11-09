import React from 'react';
import InfoCard from 'webgme-react-components/src/components/InfoCard';


export default InfoCard(
    'This is your canvas',
    (<span>
        Use the left menu to add components to your system. Locate which components you
        need and drag and drop them onto this Canvas. Based on their interfaces you can wire
        components together by clicking the port icons. <br/><br/>
        To set the parameter simply double-click it and the parameter editor will show up.
        From there you can click the inlined icon and it will take you to the official
        Modelica® Standard Library documentation.
    </span>
    ),
    {
        target: '/'/*'http://doc.modelica.org/om/Modelica.html'*/,
        title: 'Learn More About Modelica',
    },
);
