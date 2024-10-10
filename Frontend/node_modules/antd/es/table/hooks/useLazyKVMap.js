import * as React from 'react';
const useLazyKVMap = (data, childrenColumnName, getRowKey) => {
  const mapCacheRef = React.useRef({});
  function getRecordByKey(key) {
    var _a;
    if (!mapCacheRef.current || mapCacheRef.current.data !== data || mapCacheRef.current.childrenColumnName !== childrenColumnName || mapCacheRef.current.getRowKey !== getRowKey) {
      const kvMap = new Map();
      /* eslint-disable no-inner-declarations */
      function dig(records) {
        records.forEach((record, index) => {
          const rowKey = getRowKey(record, index);
          kvMap.set(rowKey, record);
          if (record && typeof record === 'object' && childrenColumnName in record) {
            dig(record[childrenColumnName] || []);
          }
        });
      }
      /* eslint-enable */
      dig(data);
      mapCacheRef.current = {
        data,
        childrenColumnName,
        kvMap,
        getRowKey
      };
    }
    return (_a = mapCacheRef.current.kvMap) === null || _a === void 0 ? void 0 : _a.get(key);
  }
  return [getRecordByKey];
};
export default useLazyKVMap;