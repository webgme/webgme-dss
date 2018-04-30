import {connect} from 'react-redux';

import ProjectHistory from '../../components/Dialogs/ProjectHistory';

const mapStateToProps = state => ({
    userIdToDisplayName: state.users.userIdToDisplayName,
});

const mapDispatchToProps = (/* dispatch */) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistory);