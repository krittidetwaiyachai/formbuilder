import common from './common';
import dashboard from './dashboard';
import builder from './builder';
import properties from './properties';
import settings from './settings';
import auth from './auth';
import error from './error';
import publicForm from './public';
import analytics from './analytics';
import activity from './activity';

export default {
  ...common,
  ...dashboard,
  ...builder,
  ...properties,
  ...settings,
  ...auth,
  ...error,
  ...publicForm,
  ...analytics,
  ...activity
};
