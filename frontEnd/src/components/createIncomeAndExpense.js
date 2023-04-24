import {CreateSpecialElement} from "../services/createSpecialElement.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class CreateIncomeAndExpense {
    constructor(page) {
        this.typeRecordElement = $('#type-record');
        this.categotyRecordElement = $('#category-record');

        CreateSpecialElement.createCalendar();

        $('#incomeExpense').addClass('active');

        $('select').on('change', function () {
            $(this).addClass('text-black');
        });
        const that = this;
        this.typeRecordElement.on('change', function () {
            that.getCategory(this.value);
            that.categotyRecordElement.removeClass('text-black');
        });

        $('[required]').on('change', function (e) {
            $(this).removeClass('border-danger')
        });

        $('#search-from-date').on('apply.daterangepicker',function (e) {
            $(this).removeClass('border-danger')
        });

        if (page === 'create') {
            if (localStorage.getItem('typeRecord')) {
                this.typeRecordElement.val(localStorage.getItem('typeRecord')).change();
            }

            $('#create-operation').on('click', function (e) {
                that.createOperation();
            })
        } else {
            this.idRecord = localStorage.getItem('idRecord');
            this.getInfoOperation();
            $('#save').on('click', function (e) {
                that.updateOperation();
            })
        }
    }
    validateFields(){
        let valid = true;
        $('[required]').each(function (e) {
            let _this = $(this);
            if (!_this.val()) {
                _this.addClass('border-danger');
                valid = false;
            }
        })
        return valid;
    }

    async createOperation() {
        if (this.validateFields()) {
            try {
                const result = await CustomHttp.request(config.host + '/operations', 'POST', {
                    type: this.typeRecordElement.val(),
                    amount: $('#amount').val(),
                    date: CreateSpecialElement.convertToFormatDate($('#search-from-date').val(), 'DDMMYYYY', '.'),
                    comment: $('#comment').val(),
                    category_id: +this.categotyRecordElement.val()
                });

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    location.href = '#/incomeExpense';
                }
            } catch (e) {
                return console.log(e);
            }
        }
    }

    async updateOperation() {
        if (this.idRecord && this.validateFields()) {
            try {
                const result = await CustomHttp.request(config.host + '/operations/' + this.idRecord, 'PUT', {
                    type: this.typeRecordElement.val(),
                    amount: +$('#amount').val(),
                    date: CreateSpecialElement.convertToFormatDate($('#search-from-date').val(), 'DDMMYYYY', '.'),
                    comment: $('#comment').val(),
                    category_id: +this.categotyRecordElement.val()
                });

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    location.href = '#/incomeExpense';
                }
            } catch (e) {
                return console.log(e);
            }
        }
    }

    async getInfoOperation() {
        if (this.idRecord) {
            try {
                const result = await CustomHttp.request(config.host + '/operations/' + this.idRecord);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.typeRecordElement.val(result.type).addClass('text-black');
                    await this.getCategory(result.type, result.category);-
                    $('#amount').val(result.amount);
                    $('#search-from-date').val(CreateSpecialElement.convertToFormatDate(result.date, 'YYYYMMDD', '-', 'DDMMYYYY', '.'))
                    $('#comment').val(result.comment);
                }
            } catch (e) {
                return console.log(e);
            }
        }
    }

    async getCategory(type, categorySelect = '') {
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + type);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.categotyRecordElement.html('<option value="" disabled selected>Категория...</option>');

                result.forEach(item => {
                    let selected = ''
                    if (categorySelect && item.title === categorySelect) {
                        selected = 'selected';
                        this.categotyRecordElement.addClass('text-black');
                    }
                    let category = `<option value="${item.id}" ${selected}>${item.title}</option>`;
                    this.categotyRecordElement.html((index, oldHtml) => oldHtml + category);
                })
            }
        } catch (e) {
            return console.log(e);
        }
    }
}
