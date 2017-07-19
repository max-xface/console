import _ from 'lodash';
import {connect} from 'react-redux';
import Immutable from 'immutable';

import { coFetchJSON } from './co-fetch';

export const FLAGS = {
  AUTH_ENABLED: 'AUTH_ENABLED',
  CLUSTER_UPDATES: 'CLUSTER_UPDATES',
  RBAC: 'RBAC',
  REVOKE_TOKEN: 'REVOKE_TOKEN',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  ETCD_OPERATOR: 'ETCD_OPERATOR',
  PROMETHEUS: 'PROMETHEUS',
  MULTI_CLUSTER: 'MULTI_CLUSTER',
};

const DEFAULTS = {
  [FLAGS.AUTH_ENABLED]: !window.SERVER_FLAGS.authDisabled,
  [FLAGS.CLUSTER_UPDATES]: undefined,
  [FLAGS.RBAC]: undefined,
  [FLAGS.REVOKE_TOKEN]: !!window.SERVER_FLAGS.kubectlClientID,
  [FLAGS.USER_MANAGEMENT]: undefined,
  [FLAGS.ETCD_OPERATOR]: undefined,
  [FLAGS.PROMETHEUS]: undefined,
  [FLAGS.MULTI_CLUSTER]: undefined,
};

const SET_FLAGS = 'SET_FLAGS';
const setFlags = (dispatch, flags) => dispatch({flags, type: SET_FLAGS});

//These flags are currently being set on the client side for Phase 0 of this
//feature, the plan is to move them to the backend eventually.
const determineMultiClusterFlag = () => {
  const fedApiUrl = localStorage.getItem('federation-apiserver-url') || null;
  const token = localStorage.getItem('federation-apiserver-token') || null;

  if (fedApiUrl && token) {
    return {
      [FLAGS.MULTI_CLUSTER]: {
        'federation-apiserver-url': fedApiUrl,
        'federation-apiserver-token': token,
      }
    };
  }
  return { [FLAGS.MULTI_CLUSTER]: undefined };
};

const K8S_FLAGS = {
  [FLAGS.RBAC]: '/apis/rbac.authorization.k8s.io',
};

const COREOS_FLAGS = {
  [FLAGS.CLUSTER_UPDATES]: 'channeloperatorconfigs',
};

const ETCD_OPERATOR_FLAGS = {
  [FLAGS.ETCD_OPERATOR]: 'clusters',
};

const PROMETHEUS_FLAGS = {
  [FLAGS.PROMETHEUS]: 'prometheuses',
};

const detectK8sFlags = basePath => dispatch => coFetchJSON(basePath)
  .then(res => setFlags(dispatch, _.mapValues(K8S_FLAGS, path => res.paths.indexOf(path) >= 0)),
    () => setTimeout(() => detectK8sFlags(basePath), 5000));

const detectCoreosFlags = coreosPath => dispatch => coFetchJSON(coreosPath)
  .then(res => setFlags(dispatch, _.mapValues(COREOS_FLAGS, name => _.find(res.resources, {name}))),
    () => setTimeout(() => detectCoreosFlags(coreosPath), 5000));

const detectEtcdOperatorFlags = etcdPath => dispatch => coFetchJSON(etcdPath)
  .then(res => setFlags(dispatch, _.mapValues(ETCD_OPERATOR_FLAGS, name => _.find(res.resources, {name}))),
    () => setTimeout(() => detectEtcdOperatorFlags(etcdPath), 5000));

const detectPrometheusFlags = monitoringPath => dispatch => coFetchJSON(monitoringPath)
  .then(res => setFlags(dispatch, _.mapValues(PROMETHEUS_FLAGS, name => _.find(res.resources, {name}))),
    () => setTimeout(() => detectPrometheusFlags(monitoringPath), 5000));

const detectMultiClusterFlags = () => dispatch => {
  const multiCluster = determineMultiClusterFlag();
  setFlags(dispatch, multiCluster);
};

export const featureActions = {
  detectK8sFlags,
  detectCoreosFlags,
  detectEtcdOperatorFlags,
  detectPrometheusFlags,
  detectMultiClusterFlags
};

export const featureReducerName = 'FLAGS';
export const featureReducers = (state, action)  => {
  if (!state) {
    return Immutable.Map(DEFAULTS);
  }

  switch (action.type) {
    case SET_FLAGS:
      _.each(action.flags, (v, k) => {
        if (!FLAGS[k]) {
          throw new Error(`unknown key for reducer ${k}`);
        }
      });
      return state.merge(action.flags);
  }

  return state;
};

export const stateToProps = (flags, state) => {
  const props = {flags: {}};
  _.each(flags, f => {
    props.flags[f] = state[featureReducerName].get(f);
  });
  return props;
};

export const connectToFlags = (...flags) => connect(state => stateToProps(flags, state));
