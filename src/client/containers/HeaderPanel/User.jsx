import {connect} from 'react-redux';

import User from '../../components/HeaderPanel/User';

const mapStateToProps = state => ({
    userInfo: state.users.currentUser,
});

const mapDispatchToProps = (/* dispatch */) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(User);