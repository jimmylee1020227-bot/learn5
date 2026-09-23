const { URLSearchParams } = require('url');

const hash = '#state=state_parameter_passthrough_value&access_token=ya29.a0...&token_type=Bearer&expires_in=3599&scope=email%20profile%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile%20openid&authuser=0&prompt=none';

const params = new URLSearchParams(hash.substring(1));
console.log(params.get('access_token'));
