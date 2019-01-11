/** @format */

/**
 * External dependencies
 */
import { get, pick, set, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { STATS_CHART_COUNTS_REQUEST, STATS_CHART_COUNTS_RECEIVE } from 'state/action-types';
import { counts as countsSchema, isLoading as isLoadingSchema } from './schema';
import { QUERY_FIELDS } from './constants';

/**
 * Returns the updated count records state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function counts( state = {}, action ) {
	switch ( action.type ) {
		case STATS_CHART_COUNTS_RECEIVE: {
			const ID = 'period';
			const records = get( state, `${ action.siteId }.${ action.period }`, [] ).slice();
			const recordIds = records.map( count => count[ ID ] );

			let areThereChanges = false;

			// Merge existing records with records from API
			action.data.forEach( recordFromApi => {
				const index = recordIds.indexOf( recordFromApi[ ID ] );
				if ( index >= 0 ) {
					const newRecords = { ...records[ index ], ...recordFromApi };
					areThereChanges = areThereChanges || ! isEqual( newRecords, records[ index ] );
					records[ index ] = newRecords;
				} else {
					areThereChanges = true;
					records.push( recordFromApi );
				}
			} );

			// Avoid changing state if nothing's changed.
			if ( ! areThereChanges ) {
				return state;
			}

			const newState = { ...state };
			set( newState, `${ action.siteId }.${ action.period }`, records );
			return newState;
		}
	}
	return state;
}
counts.schema = countsSchema;

/**
 * Returns the loading state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isLoading( state = {}, action ) {
	switch ( action.type ) {
		case STATS_CHART_COUNTS_REQUEST: {
			const nextState = { ...state };
			action.statFields.forEach( statField => {
				set( nextState, `${ action.siteId }.${ action.period }.${ statField }`, true );
			} );
			return nextState;
		}
		case STATS_CHART_COUNTS_RECEIVE: {
			const nextState = { ...state };
			Object.keys( pick( action.data[ 0 ], QUERY_FIELDS ) ).forEach( statField => {
				set( nextState, `${ action.siteId }.${ action.period }.${ statField }`, false );
			} );
			return nextState;
		}
		// TODO: Add failure handling
	}
	return state;
}
isLoading.schema = isLoadingSchema;

export default combineReducers( { counts, isLoading } );
