import * as _ from 'lodash';
import {
	generateAbstractSqlModel,
	aliasTable,
	renameEnvVarName,
} from './abstract-sql-utils';

export const apiRoot = 'resin';
export const modelName = 'balena';
export const migrationsPath = __dirname + '/migrations/';
export const initSqlPath = __dirname + '/balena-init.sql';
export const abstractSql = generateAbstractSqlModel(__dirname + '/balena.sbvr');

aliasTable(abstractSql, 'application', 'my application', {
	extraBinds: [],
	abstractSqlQuery: ['Resource', 'application'],
});

renameEnvVarName(abstractSql);