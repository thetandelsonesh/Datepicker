class TanDatepicker {

    utility = {
        getFirstDate: (date) => {
            const firstDateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            while (firstDateMonth.getDay() !== 0) {
                firstDateMonth.setDate(firstDateMonth.getDate() - 1);
            }
            return firstDateMonth
        },
        getLastDate: (date) => {
            const lastDateMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            while (lastDateMonth.getDay() !== 6) {
                lastDateMonth.setDate(lastDateMonth.getDate() + 1);
            }
            return lastDateMonth
        },
        dateEqual: (d1, d2) => {
            return (
                (d1.getDate() === d2.getDate())
                && (d1.getMonth() === d2.getMonth())
                && (d1.getFullYear() === d2.getFullYear())
            )
        },
        formatDate: (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${date.getFullYear()}-${month}-${day}`
        },
        generateDate: (y, m) => {
            const month = this.months.indexOf(m);
            return new Date(y, month, 1);
        }
    };

    today = new Date();

    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    template = {
        head: '',
        body: ''
    };

    options = {
        selectedYear: this.today.getFullYear(),
        selectedMonth: this.months[this.today.getMonth()],
        selectedDate: this.today,
        minYear: 1900,
        maxYear: 2999,
    };


    constructor(targetID, options = {}) {
        this.targetElement = document.getElementById(targetID);
        this.handleOptions(options);
        this.tanDatepicker = document.createElement('div');
        this.tanDatepicker.classList.add('tan-datepicker');

        this.generateHead();
        this.preBindEvents();
    }

    handleOptions = (options) => {
        this.options = {
            ...this.options,
            ...options
        };

        if(this.targetElement.value){
            this.options.selectedDate = new Date(this.targetElement.value);
            this.options.selectedYear = this.options.selectedDate.getFullYear() ;
            this.options.selectedMonth = this.months[this.options.selectedDate.getMonth()];
        }else if(options.selectedDate){
            this.targetElement.value = this.utility.formatDate(options.selectedDate);
            this.options.selectedYear = options.selectedDate.getFullYear() ;
            this.options.selectedMonth = this.months[options.selectedDate.getMonth()];
        }

    };

    buildDatepickerDOM = () => {
        this.generateBody();
        this.getFrameInner();
        this.attachToDOM();
    };

    getFrameInner = () => {
        const {head, body} = this.template;
        return `
            <div class="tan-datepicker-head">
                <div class="tan-pickers">
                    <div class="tan-picker-left">
                        <button class="tan-arrow arrow-left" id="tan-month-prev"></button>
                        <input type="text" id="tan-month" readonly>
                        <button class="tan-arrow arrow-right" id="tan-month-next"></button>

                    </div>
                    <div class="tan-picker-right">
                        <button class="tan-arrow arrow-left" id="tan-year-prev"></button>
                        <input type="text" id="tan-year">
                        <button class="tan-arrow arrow-right" id="tan-year-next"></button>
                    </div>
                </div>
            </div>
            <div class="tan-datepicker-body">
                <table>
                    <thead>
                    ${head}
                    </thead>
                    <tbody id="tan-datepicker-body">
                    ${body}
                    </tbody>
                </table>
            </div>`
    }

    attachToDOM = () => {
        this.tanDatepicker.innerHTML = this.getFrameInner();
        this.tanDatepicker.classList.add('active');
        document.body.appendChild(this.tanDatepicker);
        this.tanDatepicker.style.left = `${this.targetElement.offsetLeft}px`;
        this.tanDatepicker.style.top = `${this.targetElement.offsetTop + 24}px`;

        this.bindEvents();
        this.postBindEvents();
    }

    removeFromDOM = () => {
        this.tanDatepicker.classList.remove('active');
        this.tanDatepicker.remove();
    }

    preBindEvents = () => {
        this.targetElement.addEventListener('focus', this.buildDatepickerDOM);

        document.addEventListener('click', (event) => {
            if(!this.tanDatepicker.classList.contains('active')) return;
            let targetElement = event.target;  // clicked element
            do {
                if (targetElement === this.tanDatepicker || targetElement === this.targetElement) {
                    return;
                }
                targetElement = targetElement.parentNode;  // Go up the DOM
            } while (targetElement);
            this.removeFromDOM();
        });
    }

    bindEvents = () => {
        this.handleMonthSelector();
        this.handleYearSelector();
    };

    postBindEvents = () => {
        const tanDatepickerDays = document.getElementsByClassName('tan-day');
        Array.from(tanDatepickerDays).forEach((element) => {
            element.addEventListener('click', (event) => {
                const newSelectedDate = event.currentTarget.getAttribute('data-date');

                const selectedDate = this.utility.formatDate(this.options.selectedDate);
                const selectedDateObj = document.querySelector(`.tan-day[data-date="${selectedDate}"]`);
                selectedDateObj && selectedDateObj.classList.remove('selected');

                const newSelectedDateObj = document.querySelector(`.tan-day[data-date="${newSelectedDate}"]`);
                newSelectedDateObj.classList.add('selected');

                this.options.selectedDate = new Date(newSelectedDate);
                this.targetElement.value = newSelectedDate;
                this.removeFromDOM();
            });
        });


    };

    checkYearAndUpdateView = (yearValue) => {
        if(yearValue.toString().length !== 4) return;
        this.options.selectedYear = yearValue;
        this.rebuildCalendar();
    };

    rebuildCalendar = () => {
        this.generateBody();
        const tanDatepickerBody = document.getElementById('tan-datepicker-body');
        tanDatepickerBody.innerHTML = this.template.body;
        this.postBindEvents();
    };

    handleMonthSelector = () => {
        const selectedMonth = document.getElementById('tan-month');
        selectedMonth.value = this.options.selectedMonth;

        const prevMonth = document.getElementById('tan-month-prev');
        const nextMonth = document.getElementById('tan-month-next');

        prevMonth.addEventListener('click', () => {
            let current = this.months.indexOf(selectedMonth.value);
            if(current === 0) current = 12;
            current = (current - 1) % 12;
            this.options.selectedMonth = selectedMonth.value = this.months[current];
            this.rebuildCalendar();
        });

        nextMonth.addEventListener('click', () => {
            let current = this.months.indexOf(selectedMonth.value);
            current = (current + 1) % 12;
            this.options.selectedMonth = selectedMonth.value = this.months[current];
            this.rebuildCalendar();
        });
    };

    handleYearSelector = () => {
        const selectedYear = document.getElementById('tan-year');
        selectedYear.value = this.options.selectedYear;


        selectedYear.addEventListener('keypress', (evt) => {
            const event = evt || window.event;
            let key;
            // Handle paste
            if (event.type === 'paste') {
                key = event.clipboardData.getData('text/plain');
            } else {
                // Handle key press
                key = event.keyCode || event.which;
                key = String.fromCharCode(key);
            }
            const regex = /[0-9]/;
            if( !regex.test(key) ) {
                event.returnValue = false;
                if(event.preventDefault) event.preventDefault();
            }
            this.checkYearAndUpdateView(key);
        });

        selectedYear.addEventListener('blur', () => {
            let current = isNaN(selectedYear.value) ?  this.options.selectedYear : parseInt(selectedYear.value);
            if(current < this.options.minYear){
                selectedYear.value = this.options.minYear;
            }else if(current > this.options.maxYear){
                selectedYear.value = this.options.maxYear;
            }
            this.checkYearAndUpdateView(selectedYear.value);
        });

        const prevYear = document.getElementById('tan-year-prev');
        const nextYear = document.getElementById('tan-year-next');

        prevYear.addEventListener('click', () => {
            let current = isNaN(selectedYear.value) ?  this.options.selectedYear : parseInt(selectedYear.value);
            selectedYear.value = --current;
            if(current < this.options.minYear){
                selectedYear.value = this.options.minYear;
            }else if(current > this.options.maxYear){
                selectedYear.value = this.options.maxYear;
            }
            this.checkYearAndUpdateView(selectedYear.value);
        });

        nextYear.addEventListener('click', () => {
            let current = isNaN(selectedYear.value) ?  this.options.selectedYear : parseInt(selectedYear.value);
            selectedYear.value = ++current;
            if(current < this.options.minYear){
                selectedYear.value = this.options.minYear;
            }else if(current > this.options.maxYear){
                selectedYear.value = this.options.maxYear;
            }
            this.checkYearAndUpdateView(selectedYear.value);
        })
    }

    generateHead = () => {
        let days = '';
        this.days.forEach((day => {
            days += `<th class="dow ${day.toLowerCase()}">${day}</th>`;
        }));
        this.template.head = `<tr>${days}</tr>`
    }

    generateBody = () => {
        const date = this.utility.generateDate(this.options.selectedYear, this.options.selectedMonth);
        const firstDate = this.utility.getFirstDate(date);
        const lastDate = this.utility.getLastDate(date);
        let body = '';
        let bodyrow = '';
        for (const d = firstDate; d <= lastDate; d.setDate(d.getDate() + 1)) {
            const classList = [];

            if (this.utility.dateEqual(d, this.today)) {
                classList.push('today');
            }

            if (this.options.selectedDate && this.utility.dateEqual(d, this.options.selectedDate)) {
                classList.push('selected');
            }

            if (date.getMonth() !== d.getMonth()) {
                classList.push('old');
            }
            const formattedDate = this.utility.formatDate(d);
            bodyrow += ` <td data-date="${formattedDate}" class="tan-day ${classList.join(' ')}">${d.getDate()}</td>`;

            if (d.getDay() === 6) {
                body += `<tr>${bodyrow}</tr>`
                bodyrow = '';
            }
        }
        body += `<tr>${bodyrow}</tr>`
        this.template.body = body;
    }

}
