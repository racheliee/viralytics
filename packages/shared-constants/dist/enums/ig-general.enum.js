"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeframeEnum = exports.DemographicBreakdownEnum = exports.MetricTypeEnum = exports.PeriodEnum = exports.MetricEnum = void 0;
var MetricEnum;
(function (MetricEnum) {
    MetricEnum["FOLLOWER_DEMOGRAPHICS"] = "follower_demographics";
    MetricEnum["ENGAGED_AUDIENCE_DEMOGRAPHICS"] = "engaged_audience_demographics";
})(MetricEnum || (exports.MetricEnum = MetricEnum = {}));
var PeriodEnum;
(function (PeriodEnum) {
    PeriodEnum["LIFETIME"] = "lifetime";
    PeriodEnum["DAY"] = "day";
})(PeriodEnum || (exports.PeriodEnum = PeriodEnum = {}));
var MetricTypeEnum;
(function (MetricTypeEnum) {
    MetricTypeEnum["TOTAL_VALUE"] = "total_value";
})(MetricTypeEnum || (exports.MetricTypeEnum = MetricTypeEnum = {}));
var DemographicBreakdownEnum;
(function (DemographicBreakdownEnum) {
    DemographicBreakdownEnum["GENDER"] = "gender";
    DemographicBreakdownEnum["AGE"] = "age";
    DemographicBreakdownEnum["COUNTRY"] = "country";
})(DemographicBreakdownEnum || (exports.DemographicBreakdownEnum = DemographicBreakdownEnum = {}));
var TimeframeEnum;
(function (TimeframeEnum) {
    TimeframeEnum["LAST_14_DAYS"] = "last_14_days";
    TimeframeEnum["LAST_30_DAYS"] = "last_30_days";
    TimeframeEnum["LAST_90_DAYS"] = "last_90_days";
    TimeframeEnum["PREV_MONTH"] = "prev_month";
    TimeframeEnum["THIS_MONTH"] = "this_month";
})(TimeframeEnum || (exports.TimeframeEnum = TimeframeEnum = {}));
