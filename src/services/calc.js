import Dinero from 'dinero.js';
const dict = {
	annual: {
		factor: 3.154e+7,
		precision: 0,
		format: '$0',
	},
	monthly: {
		factor: 2.628e+6,
		precision: 0,
		format: '$0',
	},
	daily: {
		factor: 86400,
		precision: 2,
	},
	hourly: {
		factor: 3600,
		precision: 2,
	},
	everyMinute: {
		factor: 60,
		precision: 6,
		format: '$0.00000',
	},
	everySecond: {
		factor: 1,
		precision: 12,
		format: '$0.00000000',
	},
	everyMillisecond: {
		factor: 0.001,
		precision: 20,
		format: '$0.00000000000',
	},
}

const getFormat = periodTo => dict[periodTo].format || undefined;

const toPeriod = (value, periodFrom, periodTo) => {
	let factor;
	const precision = dict[periodTo].precision;
	if (periodFrom === periodTo){
		factor = 1;
	}
	else{
		factor = dict[periodTo].factor / dict[periodFrom].factor;
	}
	//return parseInt(calculated);
	const money = Dinero({ amount: value * Math.pow(10, precision), currency: 'EUR', precision })
	.multiply(factor);
	const format = getFormat(periodTo);
	return {money, format};
}

const total = (arr, periodTo) => {
	let total = Dinero({currency: 'EUR'});
	arr.forEach(el => {
		total = total.add(toPeriod(el.value, el.period, periodTo).money);
	});
	const format = getFormat(periodTo);
	return {money: total, format};
};

export {toPeriod, total};