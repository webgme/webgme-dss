import {connect} from 'react-redux';

import UserProfileNavigator from 'webgme-react-components/src/components/UserProfileNavigator';

const mapStateToProps = state => ({
    userInfo: state.users.currentUser,
});

const mapDispatchToProps = (/* dispatch */) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileNavigator);
