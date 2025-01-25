var DatePicker = (function () {
    // ˽�з���
    function createElement(tag, className) {
        var el = document.createElement(tag);
        if (className) {
            el.className = className;
            el.id = className;
        }
        return el;
    }

    function addEvent(element, type, handler) {
        if (!element || !element.nodeType) return;
        var eventType = type.toLowerCase();
        try {
            if (element.addEventListener) {
                element.addEventListener(eventType, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventType, function (e) {
                    return handler.call(element, e || window.event);
                });
            }
        } catch (e) { }
    }

    function removeEvent(element, type, handler) {
        if (!element || !element.nodeType) return;
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + type, handler);
        }
    }

    function padZero(num) {
        return (num < 10 ? '0' : '') + num;
    }

    function DatePicker(input, options) {
        if (!input || !input.nodeType) throw new Error('Invalid input element');
        this.input = input;
        this.options = this.normalizeOptions(options || {});
        this.currentDate = new Date();
        this.picker = document.getElementById('datepicker');
        if (!this.picker)
            this.init();
    }

    DatePicker.prototype = {
        normalizeOptions: function (options) {
            var defaultFormat = 'YYYY-MM-DD HH:mm:ss';
            var format = (options.format || defaultFormat)
                .replace(/yyyy/g, 'YYYY')
                .replace(/dd/g, 'DD')
                .replace(/h/g, 'HH');

            return {
                format: format,
                showTime: /([Hh]|m|s)/.test(format)
            };
        },

        init: function () {
            this.createPicker();
            this.bindEvents();
            this.hide();
            this.options.showTime && this.initTimeSelection();
            this.bindScrollHandler();
            this.picker.style.zIndex = 9999;
        },

        createPicker: function () {
            var self = this;
            this.picker = createElement('div', 'datepicker');
            this.picker.style.cssText = 'display:none;width:180px;';

            // Header
            this.header = createElement('div', 'datepicker-header');
            // �������л���ť
            this.prevYear = createElement('span', 'datepicker-nav');
            this.prevYear.innerHTML = ' << ';
            this.nextYear = createElement('span', 'datepicker-nav');
            this.nextYear.innerHTML = ' >> ';
            // ����·��л���ť
            this.prevMonth = createElement('span', 'datepicker-nav');
            this.prevMonth.innerHTML = ' < ';
            this.nextMonth = createElement('span', 'datepicker-nav');
            this.nextMonth.innerHTML = '>';
            this.title = createElement('span');
            this.header.appendChild(this.prevYear);
            this.header.appendChild(this.prevMonth);
            this.header.appendChild(this.title);
            this.header.appendChild(this.nextMonth);
            this.header.appendChild(this.nextYear);
            this.picker.appendChild(this.header);

            // Table
            this.table = createElement('table');
            var thead = createElement('thead');
            this.tbody = createElement('tbody');
            var weekDays = ['��', 'һ', '��', '��', '��', '��', '��'];

            var tr = createElement('tr');
            for (var i = 0; i < 7; i++) {
                var th = createElement('th');
                th.innerHTML = weekDays[i];
                tr.appendChild(th);
            }
            thead.appendChild(tr);
            this.table.appendChild(thead);
            this.table.appendChild(this.tbody);
            this.picker.appendChild(this.table);

            // Time Section
            this.timeSection = createElement('div', 'time-section');
            this.createTimeSelectors();
            this.picker.appendChild(this.timeSection);

            document.body.appendChild(this.picker);
        },
        createTimeSelectors: function () {
            var types = ['hour', 'minute', 'second'];
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                var select = createElement('select', 'time-select');
                select.id = type + 'Select';
                this.timeSection.appendChild(select);
            }
        },

        initTimeSelection: function () {
            this.hourSelect = document.getElementById('hourSelect');
            this.minuteSelect = document.getElementById('minuteSelect');
            this.secondSelect = document.getElementById('secondSelect');

            // �������ѡ��޸��ظ�������⣩
            this.clearSelect(this.hourSelect);
            this.clearSelect(this.minuteSelect);
            this.clearSelect(this.secondSelect);

            this.populateSelect(this.hourSelect, 0, 23);
            this.populateSelect(this.minuteSelect, 0, 59);
            this.populateSelect(this.secondSelect, 0, 59);

            var now = new Date();
            this.setSelectValue(this.hourSelect, padZero(now.getHours()));
            this.setSelectValue(this.minuteSelect, padZero(now.getMinutes()));
            this.setSelectValue(this.secondSelect, padZero(now.getSeconds()));
        },
        clearSelect: function (select) {
            // IE7���ݵ���շ���
            if (select.options) {
                while (select.options.length > 0) {
                    select.remove(0);
                }
            }
        },
        populateSelect: function (select, start, end) {
            for (var i = start; i <= end; i++) {
                var option = document.createElement('option');
                option.value = padZero(i);
                option.text = padZero(i);
                try {
                    select.add(option);
                } catch (e) {
                    select.add(option, null);
                }
            }
        },

        setSelectValue: function (select, value) {
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].value === value) {
                    select.selectedIndex = i;
                    break;
                }
            }
        },

        bindEvents: function () {
            var self = this;

            addEvent(this.input, 'click', function () {
                self.show();
            });

            var navButtons = [this.prevMonth, this.nextMonth];
            for (var i = 0; i < navButtons.length; i++) {
                (function (button) {
                    addEvent(button, 'click', function () {
                        var isNextMonth = (button === self.nextMonth);
                        self.currentDate.setMonth(
                            self.currentDate.getMonth() + (isNextMonth ? 1 : -1)
                        );
                        self.render();
                    });
                })(navButtons[i]);
            }
            // ����л��¼�
            addEvent(this.prevYear, 'click', function () {
                self.currentDate.setFullYear(self.currentDate.getFullYear() - 1);
                self.render();
            });

            addEvent(this.nextYear, 'click', function () {
                self.currentDate.setFullYear(self.currentDate.getFullYear() + 1);
                self.render();
            });


            addEvent(this.tbody, 'click', function (e) {
                var target = e.target || event.srcElement;
                if (target.tagName === 'TD' && target.innerHTML !== '') {
                    var day = parseInt(target.innerHTML, 10);
                    if (!isNaN(day)) self.selectDate(day);
                }
            });

            if (this.options.showTime) {
                var timeTypes = ['hour', 'minute', 'second'];
                for (var j = 0; j < timeTypes.length; j++) {
                    var type = timeTypes[j];
                    addEvent(this[type + 'Select'], 'change', function () {
                        self.updateTime();
                    });
                }
            }
        },

        bindScrollHandler: function () {
            var self = this, timer;
            addEvent(window, 'scroll', function () {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    self.positionPicker();
                }, 50);
            });
            // ʹ�ñհ����� this ����
            var self = this;
            addEvent(window, 'resize', function () {
                self.positionPicker();
            });
        },

        updateTime: function () {
            var tempDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                this.currentDate.getDate(),
                this.hourSelect.value,
                this.minuteSelect.value,
                this.secondSelect.value
            );
            this.input.value = this.formatDate(tempDate);
        },

        selectDate: function (day) {
            // �Ƴ��ɸ���������IE7д����
            var cells = this.tbody.getElementsByTagName('td');
            for (var i = 0; i < cells.length; i++) {
                if (cells[i].className.indexOf('selected-day') > -1) {
                    cells[i].className = '';
                }
            }
            // ��Ӹ�����ֱ�Ӳ���DOM��������Ⱦ��
            var targetCell = this.findDateCell(day);
            if (targetCell) targetCell.className = 'selected-day';
            // ע�⣺�Ƴ�this.hide() ��Ϊ˫���ر�
            //this.render(); // ������Ⱦ����ʾ����
        },
        // ��������������ָ�����ڵĵ�Ԫ��
        findDateCell: function (day) {
            var cells = this.tbody.getElementsByTagName('td');
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                if (cell.innerHTML == day) return cell;
            }
            return null;
        },
        formatDate: function (date) {
            var replacements = {
                'YYYY': date.getFullYear(),
                'MM': padZero(date.getMonth() + 1),
                'DD': padZero(date.getDate()),
                'HH': padZero(date.getHours()),
                'mm': padZero(date.getMinutes()),
                'ss': padZero(date.getSeconds())
            };
            return this.options.format.replace(
                /YYYY|MM|DD|HH|mm|ss/g,
                function (match) {
                    return replacements[match];
                }
            );
        },
        // �����������ж��Ƿ�Ϊͬһ��
        isSameDay: function (date1, date2) {
            return date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate();
        },
        render: function () {
            var self = this; // ��ȷ����DatePickerʵ��
            var year = this.currentDate.getFullYear();
            var month = this.currentDate.getMonth();
            if (this.title)
                this.title.innerHTML = year + '��' + (month + 1) + '��';
            else
                this.picker.title.innerHTML = year + '��' + (month + 1) + '��';
            var tbody = this.tbody;
            if (!tbody) {
                this.tbody = this.picker.getElementsByTagName('tbody')[0];
                tbody = this.tbody;
                this.table = this.picker.getElementsByTagName('table')[0];
                var thead = this.picker.getElementsByTagName('thead')[0];
            }
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var startDay = firstDay.getDay();
            var endDate = lastDay.getDate();
            var date = 1;
            for (var i = 0; i < 6; i++) {
                var tr = createElement('tr');
                for (var j = 0; j < 7; j++) {
                    var td = createElement('td');
                    if (i === 0 && j < startDay) {
                        td.innerHTML = '&nbsp;';
                    } else if (date > endDate) {
                        td.innerHTML = '&nbsp;';
                    } else {
                        td.innerHTML = date;
                        date++;
                    }
                    // ���˫���¼���IE7����д����
                    addEvent(td, 'dblclick', function (e) {
                        var day = parseInt(this.innerHTML, 10);
                        if (!isNaN(day)) {
                            var selectedDate = new Date(
                                self.currentDate.getFullYear(),
                                self.currentDate.getMonth(),
                                day,
                                self.options.showTime ? self.hourSelect.value : 0,
                                self.options.showTime ? self.minuteSelect.value : 0,
                                self.options.showTime ? self.secondSelect.value : 0
                            );
                            self.input.value = self.formatDate(selectedDate);
                            self.hide(); // �����selfָ��DatePickerʵ��
                        }
                    });
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
                if (date > endDate) break;
            }
        },

        positionPicker: function () {
            var getOffset = function (el) {
                var offset = { top: 0, left: 0 };
                while (el) {
                    offset.top += el.offsetTop;
                    offset.left += el.offsetLeft;
                    el = el.offsetParent;
                    if (el && el.nodeType === 1 && el.currentStyle.position === 'static') break;
                }
                return offset;
            };

            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            var offset = getOffset(this.input);

            this.picker.style.top = (offset.top + this.input.offsetHeight + scrollTop) + 'px';
            this.picker.style.left = (offset.left + scrollLeft) + 'px';

            // IE7�����޸�
            if (navigator.userAgent.indexOf('MSIE 8') > -1) {
                this.picker.style.display = 'none';
                this.picker.offsetHeight;
                this.picker.style.display = 'block';
            }
        },

        show: function () {
            if (this.picker.parentNode !== document.body) {
                document.body.appendChild(this.picker);
            }
            this.positionPicker();
            this.picker.style.display = 'block';
            this.render(); // ȷ��ÿ����ʾʱ��Ⱦ���ڣ��޸�����������⣩
            this.createCoverIframe();
            this.options.showTime && this.initTimeSelection();
        },

        createCoverIframe: function () {
            if (navigator.userAgent.indexOf('MSIE 8') > -1 && !this.coverIframe) {
                // ȷ������ѡ��������ʾ����ɲ���
                this.picker.style.display = 'block';
                this.picker.style.visibility = 'hidden'; // ��ʱ���ر�����˸

                // ��ȷ����ߴ��λ��
                var rect = {
                    width: this.picker.offsetWidth,
                    height: this.picker.offsetHeight,
                    left: this.picker.offsetLeft,
                    top: this.picker.offsetTop
                };

                // ����ʵ�ʶ�λ����
                var parent = this.picker.offsetParent;
                while (parent && parent !== document.body) {
                    rect.left += parent.offsetLeft;
                    rect.top += parent.offsetTop;
                    parent = parent.offsetParent;
                }

                // ���ǹ���ƫ��
                rect.left += (document.documentElement.scrollLeft || document.body.scrollLeft);
                rect.top += (document.documentElement.scrollTop || document.body.scrollTop);

                // ��������λiframe
                this.coverIframe = document.createElement('iframe');
                this.coverIframe.style.cssText = [
                    'position:absolute',
                    'z-index:1',
                    'border:0',
                    'filter:alpha(opacity=0)',
                    'width:' + (rect.width + 2) + 'px',  // +2 �����߿�
                    //'height:' + (rect.height + 2) + 'px',
                    'left:' + rect.left + 'px',
                    'top:' + rect.top + 'px',
                    'overflow:hidden' // ��ֹ�������
                ].join(';');

                // �ָ���ʾ״̬
                this.picker.style.visibility = 'visible';
                document.body.appendChild(this.coverIframe);
            }
        },

        hide: function () {
            this.picker.style.display = 'none';
            if (this.coverIframe) {
                this.coverIframe.parentNode.removeChild(this.coverIframe);
                this.coverIframe = null;
            }
        },

        destroy: function () {
            removeEvent(window, 'scroll', this.positionPicker);
            removeEvent(window, 'resize', this.positionPicker);
            this.picker.parentNode.removeChild(this.picker);
        }
    };

    return DatePicker;
})();