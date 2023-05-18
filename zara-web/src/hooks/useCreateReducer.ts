import { useMemo, useReducer } from 'react';

export type FieldNames<T> = {
  [K in keyof T]: T[K] extends string ? K : K;
}[keyof T];

export type Action<T> =
  | { type: 'reset' }
  | { type: 'change'; field: FieldNames<T>; value: any };

export type ActionType<T> = Action<T>; // Exporting ActionType

export const changeField = <T>(field: FieldNames<T>, value: any): Action<T> => {
  return { type: 'change', field, value };
}

export const reset = <T>(): Action<T> => {
  return { type: 'reset' };
}

export const useCreateReducer = <T>({ initialState }: { initialState: T }) => {
  const reducer = (state: T, action: Action<T>) => {
    switch(action.type) {
      case 'change':
        return { ...state, [action.field]: action.value };
      case 'reset':
        return initialState;
      default:
        throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return useMemo(() => ({ state, dispatch }), [state, dispatch]);
};