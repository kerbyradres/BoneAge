/*global document, console, $, Sly, Clipboard */
/*jshint globalstrict: true*/
"use strict";

var undef = '***',
	boneage = {
		male: {hint: {}},
		female: {hint: {}}
	},
	pt = {sex: undef},
	ref = {
		male: {
			ages: [0,3,6,9,12,15,18,24,32,36,42,48,54,60,72,84,96,108,120,132,138,150,156,162,168,180,186,192,204,216,228],
			BFages: [3,6,9,12,18,24,30,36,42,48,54,60,72,84,96,108,120,132,144,156,168,180,192,204],
			BFstdevs: [0.69,1.13,1.43,1.97,3.52,3.92,4.52,5.08,5.4,6.66,8.36,8.79,9.17,8.91,9.1,9,9.79,10.09,10.38,10.44,10.72,11.32,12.86,13.05]
		},
		female: {
			ages: [0,3,6,9,12,15,18,24,30,36,42,50,60,69,82,94,106,120,132,144,156,162,168,180,192,204,216],
			BFages: [3,6,9,12,18,24,30,36,42,48,54,60,72,84,96,108,120,132,144,156,168,180,192],
			BFstdevs: [0.72,1.16,1.36,1.77,3.49,4.64,5.37,5.97,7.48,8.98,10.73,11.65,10.23,9.64,10.23,10.74,11.73,11.94,10.24,10.67,11.3,9.23,7.31]
		},
		range: {}
	},
	SlyCarousel = {},
	dp = {};

$(document).ready(function() {

	// DATE PICKER CAROUSEL
	(function datepickerInit() {
		var config = {
			years: {
				min: new Date().getFullYear() - 25,
				max: new Date().getFullYear()
			},
			// years: 6, // alternative for last 6 years from now
			// startAt: {
			// 	year: 2014,
			// 	month: 0,	// starting at 0
			// 	day: 0		// starting at 0
			// }
			// startAt: null // alternative for starting at now
		};

		// function to retrieve the selected date (try it in console)
		// selected();        // return the whole selection as a Date object
		// selected('year');  // selected year
		// selected('month'); // month, starting at 0
		// selected('day');   // day, starting at 0

		// DATE PICKER IMPLEMENTATION
		var $picker = $('.date-picker');
		var d = new Date();
		var options = {
			itemNav: 'forceCentered',
			smart: 1,
			activateMiddle: 1,
			activateOn: 'click',
			mouseDragging: 1,
			touchDragging: 1,
			releaseSwing: 1,
			startAt: 0,
			scrollBy: 1,
			speed: 100,
			elasticBounds: 1,
			easing: 'swing'
		};

		// return selected date
		dp.selected = function (type) {
			switch (type) {
				case 'year':
					return $(dp.year.items[dp.year.rel.activeItem].el).data('year') | 0;
				case 'month':
					return dp.month.rel.activeItem;
				case 'day':
					return dp.day.rel.activeItem;
			}
			return new Date(dp.selected('year'), dp.selected('month'), dp.selected('day') + 1);
		};

		// MONTH
		var $month = $picker.find('.month');
		dp.month = new Sly($month, options);

		// populate with months
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var shortMonths = [1, 3, 5, 8, 10];
		$month.find('ul').append(months.map(dataLI('month')).join(''));

		// DAY
		var $day = $picker.find('.day');
		var $daySlidee = $day.find('ul');
		dp.day = new Sly($day, options);

		// YEAR
		var $year = $picker.find('.year');
		dp.year = new Sly($year, options);

		// populate with years
		var years = [];
		var simple = typeof config.years === 'number';
		var y = simple ? d.getFullYear() : config.years.min;
		// var y = simple ? d.getFullYear() : config.years.max;
		var max = simple ? d.getFullYear() : config.years.max;
		while (y < max + 1) years.push(y++);
		// var min = simple ? d.getFullYear() - config.years : config.years.min;
		// while (y > min) years.push(y--);
		$year.find('ul').append(years.map(dataLI('year')).join(''));

		// dynamic days
		dp.year.on('active', updateDays);
		dp.month.on('active', updateDays);

		dp.year.on('move', function() {
			boneage.preselectBoneAge();
			boneage.update();
		});
		dp.month.on('move', function() {
			boneage.preselectBoneAge();
			boneage.update();
		});
		dp.day.on('move', function() {
			boneage.preselectBoneAge();
			boneage.update();
		});

		function updateDays() {
			var month = dp.selected('month');
			var days = 31;
			if (~$.inArray(month, shortMonths)) {
				if (month === 1) days = isLeapYear(dp.selected('year')) ? 29 : 28;
				else days = 30;
			}
			var i = 0;
			var items = [];
			while (++i <= days) items.push(i);
			$daySlidee
				.empty()
				.html(items.map(dataLI('day', dp.selected('day'))).join(''));
			dp.day.reload();
		}

		// initiate sly isntances
		var initial = config.startAt;
		dp.year.init().activate($.inArray(initial ? initial.year : d.getFullYear(), years));
		dp.month.init().activate(initial ? initial.month : d.getMonth());
		dp.day.init().activate(initial ? initial.day : d.getDate() - 1);

		// HELPERS
		function isLeapYear(year) {
			return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
		}

		// returns an item to <li> string mapping function
		function dataLI(type, active) {
			return function (item, i) {
				return '<li ' +
					'data-' + type + '="' + item + '" ' +
					'class="' + (i === active ? 'active' : '') + '"' +
					'>' + item + '</li>';
			};
		}

		// expose selected function so you can try it out
		// window.selected = selected;
	})();

	

	// ClipboardJS init
	(function ClipboardJSInit() {
		var clipboard = new Clipboard('#btnCopy');
		clipboard.on('success', function(e) {
			console.log(e);
		});
		clipboard.on('error', function(e) {
			console.log(e);
		});
	})();

	// preselect bone age to match chronological age, as a starting point
	boneage.preselectBoneAge = function() {
		if (SlyCarousel.initialized) {
			if (pt.sex === 'male' || pt.sex === 'female') {
				pt.getAge();
				var i, len, closestAge = null, closestAgeIndex = null;
				for (i = 0, len = ref[pt.sex].ages.length; i < len; i++) {
					if (Math.abs(pt.age - ref[pt.sex].ages[i]) < Math.abs(pt.age - closestAge) || closestAge === null) {
						closestAge = ref[pt.sex].ages[i];
						closestAgeIndex = i;
					}
				}
				SlyCarousel.activate(closestAgeIndex);
			}
		}
	};

	boneage.update = function() {
		pt.getDOB();
		ref.getToday();
		pt.getAge();
		ref.getAge();
		pt.getBoneAge();
		ref.getStDev();
		boneage.setHint();

		boneage.report =
			'<b>FINDINGS:</b><br>' +
			'Sex: ' + pt.sex + '<br>' +
			'Study Date: ' + ref.today + '<br>' +
			'Date of Birth: ' + pt.DOB + '<br>' +
			'Chronological Age: ' + strMtoY(pt.age) + '<br>' +
			'<br>' +
			'At the chronological age of ' + strMtoY(pt.age) +
				', using the Brush Foundation data, the mean bone age for calculation is ' +
				strMtoY(ref.age) +
				'. Two standard deviations at this age is ' + 2*ref.stdev +
				' months, giving a normal range of ' + strMtoY(ref.range.low) +
				' to ' + strMtoY(ref.range.high) + ' (+/- 2 standard deviations).' + '<br>' +
			'<br>' +
			'By the method of Greulich and Pyle, the bone age is estimated to be ' +
				strMtoY(pt.boneAge) + '.<br><br>' +
			'<b>IMPRESSION:</b>' + '<br>' +
			'Chronological Age: ' + strMtoY(pt.age) + '<br>' +
			'Estimated Bone Age: ' + strMtoY(pt.boneAge) + '<br>' +
			'<br>' +
			'The estimated bone age is ' + ref.concl + '.';

		$('#taReport').html(boneage.report);
	};

	boneage.setHint = function() {
		var popover = $('#wrap').data('bs.popover');

		if (pt.sex === 'male' || pt.sex === 'female') {
			var index = ref[pt.sex].ages.indexOf(pt.boneAge);
			popover.options.content = boneage[pt.sex].hint[pt.boneAge];
			popover.options.title = pt.sex + ': ' + strMtoY(pt.boneAge) +
				'<button id="poClose" class="close" style="float:right" onclick="boneage.poHide();">&times;</button>';
			popover.setContent();
		}

		// if box is checked but popover is hidden ...
		if ($('#cbHints').is(':checked') && !$("#wrap").next('div.popover:visible').length){
			// ... then show popover
			popover.show();
		}
	};

	pt.getDOB = function() {
		pt.DOBparsed = [
			'',
			String(dp.selected('month') + 1),
			String(dp.selected('day') + 1),
			String(dp.selected('year'))
		];
		pt.DOB = pt.DOBparsed.slice(1, 4).join('/');
	};

	pt.getAge = function() {
		if (pt.DOBparsed) {
			pt.birthMonth = +pt.DOBparsed[1];
			pt.birthDay = +pt.DOBparsed[2];
			pt.birthYear = +pt.DOBparsed[3];
			pt.age = (ref.month + (12 * ref.year)) - (pt.birthMonth + (12 * pt.birthYear));
			if (ref.day - pt.birthDay > 14) pt.age += 1;
			if (ref.day - pt.birthDay < -14) pt.age -= 1;
		} else {
			pt.age = undef;
		}
	};

	pt.getBoneAge = function() {
		if (pt.sex === 'male' || pt.sex === 'female') {
			pt.boneAge = ref[pt.sex].ages[SlyCarousel.rel.centerItem];
		} else {
			pt.boneAge = undef;
		}
	};

	// get ref.age (for calculation)
	ref.getAge = function() {
		var i, len;
		if ( pt.age !== undef && (pt.sex === 'male' || pt.sex === 'female') ) {
			for (i = 0, len = ref[pt.sex].BFages.length; i < len; i++) {
				if (ref.age === undef || Math.abs(ref[pt.sex].BFages[i] - pt.age) < Math.abs(ref.age - pt.age)) {
					ref.age = ref[pt.sex].BFages[i];
				}
			}
		} else {
			ref.age = undef;
		}
	};

	ref.getToday = function() {
		var Today = new Date();
		ref.month = Today.getMonth() + 1;
		ref.day = Today.getDate();
		ref.year = Today.getFullYear();
		ref.today = ref.month + '/' + ref.day + '/' + ref.year;
	};

	ref.getStDev = function() {
		if ( isNaN(pt.boneAge) || isNaN(ref.age) ) {
			ref.concl = undef;
			ref.stdev = undef;
			ref.range = {};
			return;
		}

		ref.stdev = ref[pt.sex].BFstdevs[ ref[pt.sex].BFages.indexOf(ref.age) ];
		ref.range.low = (pt.age - (2 * ref.stdev)).toFixed(2);
		ref.range.high = (pt.age + (2 * ref.stdev)).toFixed(2);

		if (pt.boneAge < ref.range.low) {
			ref.concl = '<span class="text-primary"><strong>delayed</strong></span> (' + ( (pt.age - pt.boneAge) / ref.stdev ).toFixed(1) +
				' standard deviations below the mean)';
		} else if (pt.boneAge > ref.range.high) {
			ref.concl = '<span class="text-primary"><strong>advanced</strong></span> (' + ( (pt.boneAge - pt.age) / ref.stdev ).toFixed(1) +
				' standard deviations above the mean)';
		} else {
			ref.concl = 'normal';
		}
	};

	boneage.reset = function() {
		$('#btnBoy,#btnGirl').removeClass('selected');
		pt.sex = undef;

		// reset to today's date
		var d = new Date();
		dp.month.activate(d.getMonth());
		dp.day.activate(d.getDate()-1);
		dp.year.activate(25);

		// reset RIGHT side
		$('#h2Instructions').show('slow');
		$('#prevnext').hide('slow');
		$('#divBoy, #divGirl').hide('slow');

		boneage.poHide();
		boneage.update();
		boneage.unSelectAll();
	};

	boneage.selectAll = function() {
		document.getElementById('taReport').focus();
		document.execCommand('SelectAll');
	};

	boneage.unSelectAll = function() {
		document.getElementById('taReport').focus();
		document.execCommand('unselect');
	};

	// convert age from months to years, months
	function strMtoY(ageMonths) {
		if ( ageMonths === undef || isNaN(ageMonths) ) {
			return undef;
		}
		if (ageMonths < 24) {
			return ageMonths + ' months';
		} else {
			return Math.floor(ageMonths / 12) + ' years, ' + Math.round(ageMonths % 12) + ' months';
		}
	}

	function slyInit(div) {
		var $frame = $(div),
			$wrap = $frame.parent();

		SlyCarousel = new Sly($frame, {
			horizontal: 1,
			itemNav: 'forceCentered',
			smart: 1,
			activateOn: 'click',
			activateMiddle: 1,
			mouseDragging: 1,
			touchDragging: 1,
			releaseSwing: 1,
			startAt: 0,
			scrollBar: $wrap.find('.scrollbar'),
			scrollBy: 1,
			speed: 300,
			elasticBounds: 1,
			easing: 'easeOutExpo',
			dragHandle: 1,
			dynamicHandle: 1,
			clickBar: 1
		}).init();

		SlyCarousel.on('move', function() {
			boneage.update();
		});
	}

	// when user selects sex
	$('#divSex button').click(function() {
		var sex = this.id.substr(3,4);
		$('#h2Instructions').hide('slow');
		$('#prevnext').show('slow');
		// cannot use $.hide()/show() due to block
		$('#div'+sex).css('display', 'block')
			.siblings('.frame').css('display', 'none');

		slyInit('#div'+sex);
		boneage.preselectBoneAge();

		$('#btn'+sex).addClass('selected')
			.siblings('button').removeClass('selected');

		if (sex === "Boy") pt.sex = 'male';
		if (sex === "Girl") pt.sex = 'female';

		boneage.update();
		boneage.unSelectAll();
	});

	$('#labelReport').click(function() {
		boneage.selectAll();
	});

	$('#btnReset').click(function() {
		boneage.reset();
	});

	$('#wrap').popover({
		'trigger': 'manual',
		'placement': 'left',
		'html': true,
	});

	$('#prev').click(function() {
		SlyCarousel.activate(SlyCarousel.rel.activeItem-1);
		this.blur();
	});

	$('#next').click(function() {
		SlyCarousel.activate(SlyCarousel.rel.activeItem+1);
		this.blur();
	});

	$('#cbHints').click(function() {
		if ($('#cbHints').is(':checked')) {
			$('#wrap').popover('show');
		} else {
			$('#wrap').popover('hide');
		}
	});

	boneage.poHide = function() {
		$('#wrap').popover('hide');
		$('#cbHints').attr('checked', false);
	};

	boneage.initHints();
	boneage.update();

});
