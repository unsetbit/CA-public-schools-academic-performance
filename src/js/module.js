var dimensions = [
  'API',
  'AA_API',
  'AI_API',
  'AS_API',
  'FI_API',
  'HI_API',
  'PI_API',
  'WH_API',
  'MR_API',
  'SD_API',
  'EL_API',
  'DI_API',
  'NOT_HSG',
  'HSG',
  'SOME_COL',
  'COL_GRAD',
  'GRAD_SCH',
  'ACS_46',
  'PCT_AA',
  'PCT_AI',
  'PCT_AS',
  'PCT_FI',
  'PCT_HI',
  'PCT_PI',
  'PCT_WH',
  'PCT_MR',
  'ENROLL'
];

angular.module('app', ['parallelCoordinatesChart'])
  .directive('geoChart', require('./geoDirective'))
  .controller('root', require('./rootController'));