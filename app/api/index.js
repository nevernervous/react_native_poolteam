import auth from './auth';
import pool from './pool';
import service from './service';
import admin from './admin';

export default {
  ...auth,
  ...pool,
  service,
  ...admin,
};
