// body.onloadイベントと同時にクラス定義やらなにやらを実行
jQuery( function($){

	if (typeof (exDate) != 'undefined') {
		// 2重読み込み防止（ありえないけどｗ
		return;
	};
	exDate = function(){};
	/**
	 * コンストラクタ
	 * @param _date Dateオブジェクト　nullはシステム年月日を設定
	 * @param _isTimeEvent nullはTrue
	 */
	exDate.RFC3339 = function( _date, _isTimeEvent ){
		this.date = !_date ? new Date() : _date;
		this.isTimeEvent = _isTimeEvent ? true : false;
	};

	$.extend(exDate.RFC3339, {
	
		DAY_OF_THE_WEEK : {'ja' : ['日', '月', '火', '水', '木', '金', '土'],
		                   'en' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		                   'dummy' : []
		},
		
		MONTH : {'ja' : ['睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'],
		         'en' : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		         'dummy' : []
		},

		/**
		 * 文字列をRFC3339形式と見なしてexDate.RFC3339オブジェクトを生成
		 * @param str パースする文字列
		 * @Author gull08
		 */
		parse : function( str ) {
			var m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
			if ( m ) {
				return new exDate.RFC3339( new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), 0, 0, 0) );
			}
			
			var offset = (new Date()).getTimezoneOffset() * 60 * 1000;
			var year = null;
			var mon = null;
			var day = null;
			var hour = 0;
			var min = 0;
			var sec = 0;
			
			var m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z|([+-])(\d{2}):(\d{2}))$/);
			if ( m ) {
				year = parseInt(m[1], 10);
				mon = parseInt(m[2], 10);
				day = parseInt(m[3], 10);
				hour = parseInt(m[4], 10);
				min = parseInt(m[5], 10);
				sec = parseInt(m[6], 10);
				if ( m[7] != 'Z' ) {
					offset += ( m[8] == '+' ? 1 : -1 ) * (parseInt(m[9], 10) * 60 + parseInt(m[10], 10)) * 1000 * 60;
				}
			} else {
				return new exDate.RFC3339( new Date(1970, 1, 1, 0, 0, 0) );
			}
			
			return new exDate.RFC3339( new Date(new Date(year, mon - 1, day, hour, min, sec).getTime() - offset), true );
		},
		
		dummy : 'dummy'
	
	});

	$.extend(exDate.RFC3339.prototype, {
	
		_filZero : function( str ) {
			return ('' + str).length == 1 ? '0' + str : str;
		},

		/**
		 * 指定したフォーマットで年月日を出力。ディフォルトはyyyy-MM-dd形式
		 * @param formatter yyyy:年、MM:月、dd:日 を対応する数値に変換する。
		 */
		toDateString : function( formatter ) {
			var target = formatter ? formatter : 'yyyy-MM-dd';
			target = target.replace('yyyy', this.date.getFullYear());
			target = target.replace('MM', this._filZero(this.date.getMonth() + 1 ));
			target = target.replace('dd', this._filZero(this.date.getDate()));
			return  target; 
		},

		/**
		 * 指定したフォーマットで時分秒を出力。ディフォルトはHH:mm:ss形式
		 * @param formatter HH:時、mm:分、ss:秒 を対応する数値に変換する。
		 */
		toTimeString : function( formatter ) {
			var target = formatter ? formatter : 'HH:mm:ss';
			target = target.replace('HH', this._filZero(this.date.getHours()));
			target = target.replace('mm', this._filZero(this.date.getMinutes()));
			target = target.replace('ss', this._filZero(this.date.getSeconds()));
			return  target; 
		},
	
		/**
		 * RFC3339形式で年月日時分秒を出力
		 */		toString : function() {
			return this.toDateString() + 'T' + this.toTimeString() + 'Z'; 
		},
		
		/**
		 * 日付計算
		 * @param num 加減算する値
		 */
		 addDate : function(num) {
			this.date.setTime(this.date.getTime() + num * 86400000);
			return this;
		},
		
		/**
		 * 月計算
		 * @param num 加減算する値
		 */
		addMonth : function(num) {
			this.date = new Date(this.date.getFullYear(), this.date.getMonth() + num,
								 this.date.getDate(), this.date.getHours(), this.date.getMinutes(), this.date.getSeconds());
			return this;
		},
		
		/**
		 * 年計算
		 * @param num 加減算する値
		 */
		addYear : function(num) {
			return this.addMonth( num * 12 );
		},
		
		/**
		 * 曜日の文字列取得。微妙に国際化対応ｗ
		 * @param lang 取得する言語。標準は日本語。
		 */
		getDay : function(lang) {
			return exDate.RFC3339.DAY_OF_THE_WEEK[ lang ? lang : 'ja' ][ this.date.getDay() ];
		},
		
		/**
		 * 月の文字列取得。微妙に国際化対応ｗ
		 * @param lang 取得する言語。標準は和暦ｗ
		 */
		getMonthString : function(lang) {
			return exDate.RFC3339.MONTH[ lang ? lang : 'ja' ][ this.date.getMonth() ];
		},
		
		dummy : 'dummy'
	
	});

	/**
	 * Vocalendarクラス定義
	 * ボカレンダー全般の管理クラス
	 */
	if (typeof (Vocalendar) != 'undefined') {
		// 2重読み込み防止（ありえないけどｗ
		return;
	};
	/**
	 * コンストラクター
	 */
	Vocalendar = function() {};
	/**
	 * 継承によるクラスメソッド、変数の定義
	 */
	$.extend(Vocalendar, {
	
		CALENDAR_CONTAINER : 'googleCalCNT',
	
		// Calendarクラスの配列
		_calendars : [],

		/**
		 * カレンダー（カテゴリ）オブジェクトの追加
		 * @param calendar カレンダーオブジェクト
		 */
		addCalendar : function( calendar ) {
			Vocalendar._calendars.push(calendar);
		},

		/**
		 * カレンダー（カテゴリ）オブジェクトの取得
		 * @param i カレンダーオブジェクトの添え字
		 */
		getCalendar : function(i) {
			return Vocalendar._calendars[i];
		},
		dummy : 'dummy'
	});
	
	/**
	 * Calendarクラス定義
	 * カレンダー操作用クラス
	 */
	/**
	 * コンストラクター
	 */
	Vocalendar.Calendar = function( _calendarId ) {
		this.calendarId = _calendarId;
		this.eventList = [];
		this.lastUpdated = '';
	};
	/**
	 * 継承による（prototypeなので）インスタンスメソッド、変数の定義
	 */
	$.extend(Vocalendar.Calendar.prototype, {

		//url : 'https://www.googleapis.com/calendar/v3/calendars/',
		url : 'https://www.google.com/calendar/feeds/',

		// 検索パラメータ
		param : {},

		// 検索結果のクリア
		empty : function() {
			this.eventList = [];
		},

		/**
		 * イベントリストの取得
		 * @param param 検索条件
		 * @param _completeFunc 検索終了時のコールバックメソッド
		 */
		getEvents : function(param, _completeFunc) {
			if ( _completeFunc ) {
				this.completeFunc = _completeFunc;
			}
			param['alt'] = 'json-in-script'
			param['singleevents'] = true;
			param['orderby'] = 'starttime';
			param['sortorder'] = 'ascending';
			// 設定しても反映されない・・・謎。
			//param['recurrence-expansion-end'] = '2013-12-31T23:59:59Z';
			param['start-max'] = (new exDate.RFC3339()).addYear(3).toString();
			request = $.ajax({
								//url: this.url + this.calendarId + '/events',
								url: this.url + this.calendarId + '/public/full',
								type : 'GET',
								data : param,
								dataType: 'jsonp',
								context: this,
								success : function(json) {
													this.result = json;
													// 結果が0件
													if ( !json.feed.entry ) {
														this.completeFunc();
														return;
													}
													$.merge( this.eventList, json.feed.entry);

													// 次ページがあるか？
													var isNext = false;
													jQuery.each( json.feed.link, function( i, link ) {
														if ( link.rel == 'next' ) {
															isNext = true;
														}
													});
													if ( isNext ) {
														// 次ページがあったら繰り返し取得する
														var startindex = json.feed.openSearch$startIndex.$t + 25;
														param['start-index'] = startindex;
														this.getEvents(param);
													} else {
														// 次ページがなければ完了メソッドを呼び出す
														this.completeFunc( this.eventList );
													}
												},
								error : function(data) {
											this.result = data;
											alert('データが取得できませんでした.')
										},
			});
			
		},

		result : null,

		// ディフォルトの完了メソッド
		completeFunc : function( eventList ){},

		dummy : 'dummy'
	}
	);

	/**
	 * SearchUIクラス定義
	 * ユーザーインターフェースクラス
	 */
	/**
	 * コンストラクター
	 */
	Vocalendar.SearchUI = function(){};
	$.extend(Vocalendar.SearchUI, {
	
		STRING : 'VS_searchstring',
		EXECUTE : 'VS_execute',
		CONDITION_CONTAINER : 'VS_conditionContainer',
		RESULT_CONTAINER : 'VS_resultContainer',
		
		// 初期化
		init : function() {
			// イベントハンドラの登録
			// 検索ボタン
			$('#' + Vocalendar.SearchUI.EXECUTE).bind('click', Vocalendar.SearchUI.getEvents );
			// フォーム（エンターキーで検索を走らせるため）
			$('#' + Vocalendar.SearchUI.CONDITION_CONTAINER)
				.bind('submit', function() {
					Vocalendar.SearchUI.getEvents();
					return false;
					}
				);
		},

		// 検索開始
		getEvents : function() {
		
			var calendarContainer = $('#' + Vocalendar.CALENDAR_CONTAINER);
			if ( calendarContainer ) {
				calendarContainer.fadeOut();
			}
		
			var resultContainer = $('#' + Vocalendar.SearchUI.RESULT_CONTAINER);
			resultContainer.empty();
			resultContainer.append('検索中');
			
			var param = {
				// バグ対応？半角スペースを全角に変換することでand検索を可能にする。
				q : $('#' + Vocalendar.SearchUI.STRING).val().split(' ').join('　')
			};
			target = Vocalendar.getCalendar( $('#VS_selectCalendar').get(0).value );
			target.empty();
			target.getEvents(param, Vocalendar.SearchUI.writeResult);	
		},

		/**
		 * 検索結果生成
		 * @param eventList イベントオブジェクトのリスト（json形式）
		 */
		writeResult : function( eventList ) {

			var resultContainer = $('#' + Vocalendar.SearchUI.RESULT_CONTAINER);
			resultContainer.empty();

			// ツリールート
			var events = $('<ul>').addClass('events');
			jQuery.each( this.eventList, function( i, eventData) {
				
				var startData = exDate.RFC3339.parse(eventData.gd$when[0].startTime);
				var endData   = exDate.RFC3339.parse(eventData.gd$when[0].endTime);
				if ( !endData.isTimeEvent ) {
					// 終日イベントだと終了日がなぜか+1されているので
					endData.addDate(-1);
				}

				// イベント
				var event = $('<li>').addClass('event').addClass( i % 2 == 0 ? 'even': 'odd' );
				event.attr( 'id', 'event_' + i);
				
				// イベント属性
				var vclEvent = $('<article>').addClass('VCLevent').addClass(startData.getDay('en').toLowerCase());
				if ( !startData.isTimeEvent ) {
					vclEvent.addClass('allday');
				}
				var header = $('<section>').addClass('header');
				var title = $('<h1>').addClass('title').text(eventData.title.$t);
				var startContainer = $('<div>').addClass('start');
				var startDate = $('<p>').addClass('date').text(startData.toDateString('yyyy年MM月dd日'));
				var startTime = startData.isTimeEvent ? $('<p>').addClass('time').text(startData.toTimeString('HH時mm分')) : null;
				var endContainer = $('<div>').addClass('end');
				var endDate = $('<p>').addClass('date').text(endData.toDateString('yyyy年MM月dd日'));
				var endTime = endData.isTimeEvent ? $('<p>').addClass('time').text(endData.toTimeString('HH時mm分')) : null;

				var where = $('<p>').addClass('where').text(eventData.gd$where[0].valueString);
				var content = $('<p>').addClass('content').text(eventData.content.$t);
				
				var badge = $('<aside>').addClass('badge');
				var month = $('<p>').addClass('month').text(startData.getMonthString('en').toUpperCase());
				var day = $('<p>').addClass('day').text(startData.date.getDate());
				var dow = $('<p>').addClass('dow').text(startData.getDay('en').toUpperCase());
				
				// 属性をイベントに追加
				event.append(vclEvent);
				vclEvent.append(header).append(where).append(content).append(badge);
				header.append(title).append(startContainer).append(endContainer);
				startContainer.append(startDate);
				if ( startTime ) {
					startContainer.append(startTime);
				}
				endContainer.append(endDate);
				if ( endTime ) {
					endContainer.append(endTime);
				}
				badge.append(month).append(day).append(dow);

				// ルートにイベントを追加
				events.append(event);
				
			});
				
			resultContainer.append(events);
			
		},
		
		dummy : 'dummy'
	});

	// ---- クラス定義終了 -----
	/**
	 * 初期処理
	 */
	// カレンダー（カテゴリ）のID一覧
	var calendarIds = [	'0mprpb041vjq02lk80vtu6ajgo@group.calendar.google.com',
						'5fsoru1dfaga56mcleu5mp76kk@group.calendar.google.com'
						];
	jQuery.each( calendarIds, function( i, id ) {
		Vocalendar.addCalendar( new Vocalendar.Calendar(id) );
	});
	Vocalendar.SearchUI.init();


});
