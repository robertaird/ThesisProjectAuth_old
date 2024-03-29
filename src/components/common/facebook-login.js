import React from 'react';
import { Button, Alert } from 'react-native';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { AuthSession } from 'expo';
import { loginUser } from '../../actions/user-actions';

const FB_APP_ID = '530424093970397';

class FacebookLogin extends React.Component {
  _handlePressAsync = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();

    // ! You need to add this url to your authorized redirect urls on your Facebook app ! //
    console.log({ redirectUrl });

    // NOTICE: Please do not actually request the token on the client (see:
    // response_type=token in the authUrl), it is not secure. Request a code
    // instead, and use this flow:
    // https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#confirm
    // The code here is simplified for the sake of demonstration. If you are
    // just prototyping then you don't need to concern yourself with this and
    // can copy this example, but be aware that this is not safe in production.

    let result = await AuthSession.startAsync({
      authUrl:
        `https://www.facebook.com/v2.8/dialog/oauth?response_type=token` +
        `&client_id=${FB_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });

    if (result.type !== 'success') {
      Alert.alert('Error', 'Uh oh, something went wrong');
      return;
    }

    let accessToken = result.params.access_token;
    const facebookURI = `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,last_name,first_name,email,picture.type(large)`;

    let userInfoResponse = await fetch(facebookURI);
    const {
      email, first_name, last_name, picture: { data: { url } },
    } = await userInfoResponse.json();
    const user = {
      first: first_name,
      last: last_name,
      profilePic: url,
      // ! THIS IS NOT SECURE ! //
      token: accessToken,
      email,
    };
    // ! This is where user state is being set ! //
    this.props.loginUser(user);
  };

  render = () => (
    <Button
      title="Login with Facebook"
      onPress={this._handlePressAsync}
    />
  );
}

const mapDispatchToProps = {
  loginUser,
};

FacebookLogin.propTypes = {
  loginUser: PropTypes.func.isRequired,
};

const Login = connect(null, mapDispatchToProps)(FacebookLogin);

export default Login;
