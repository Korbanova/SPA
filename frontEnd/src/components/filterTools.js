import {CreateSpecialElement} from "../services/createSpecialElement.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class FilterTools {
    static operations = [];

    constructor(callbackShow) {
        this.dateToElement = $('#search-to-date');
        this.dateFromElement = $('#search-from-date');
        this.today = new Date().toISOString().split('T')[0];
        const that = this;

        CreateSpecialElement.createCalendar();

        FilterTools.filterOperations(`interval&dateFrom=${this.today}&dateTo=${this.today}`, callbackShow);

        $('#today').on('click', this.applyFilter(`interval&dateFrom=${this.today}&dateTo=${this.today}`, callbackShow, that));
        $('#all').on('click', this.applyFilter('all', callbackShow, that));
        $('#year').on('click', this.applyFilter('year', callbackShow, that));
        $('#month').on('click', this.applyFilter('month', callbackShow, that));
        $('#week').on('click', this.applyFilter('week', callbackShow, that));

        $('#interval').on('click', function (e) {
            $('.filter-item').removeClass('active');
            this.classList.add('active');

            that.dateToElement.removeAttr('disabled');
            that.dateFromElement.removeAttr('disabled');

            if (that.dateFromElement.val()) {
                let dateFrom = CreateSpecialElement.convertToFormatDate(that.dateFromElement.val(), 'DDMMYYYY', '.');
                let dateTo = that.dateToElement.val() ? CreateSpecialElement.convertToFormatDate(that.dateToElement.val(), 'DDMMYYYY', '.') : that.today;
                FilterTools.filterOperations(`interval&dateFrom=${dateFrom}&dateTo=${dateTo}`, callbackShow);
            }
        })

        this.dateFromElement.on('apply.daterangepicker', function (e) {
            let dateFrom = CreateSpecialElement.convertToFormatDate($(this).val(), 'DDMMYYYY', '.');
            let dateTo = that.dateToElement.val();
            if (dateTo) {
                dateTo = CreateSpecialElement.convertToFormatDate(dateTo, 'DDMMYYYY', '.');
            } else {
                dateTo = that.today;
            }
            FilterTools.filterOperations(`interval&dateFrom=${dateFrom}&dateTo=${dateTo}`, callbackShow);
        });
        this.dateToElement.on('apply.daterangepicker', function (e) {
            let dateTo = CreateSpecialElement.convertToFormatDate($(this).val(), 'DDMMYYYY', '.');
            let dateFrom = that.dateFromElement.val();
            if (dateFrom) {
                dateFrom = CreateSpecialElement.convertToFormatDate(dateFrom, 'DDMMYYYY', '.');
                FilterTools.filterOperations(`interval&dateFrom=${dateFrom}&dateTo=${dateTo}`, callbackShow);
            } else {
                that.dateFromElement.addClass('empty');
            }
        })
    }

    applyFilter(paramRequest, callback, that) {
        return function (event) {
            $('.filter-item').removeClass('active');
            event.target.classList.add('active');

            if (!that.dateFromElement.attr('disabled')) {
                that.dateFromElement.attr('disabled', 'disabled');
                that.dateToElement.attr('disabled', 'disabled');
            }

            FilterTools.filterOperations(paramRequest, callback);
        }
    }

    static async filterOperations(param, callback) {
        try {
            const result = await CustomHttp.request(config.host + '/operations?period=' + param);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                FilterTools.operations = result;
                FilterTools.operations.sort((a, b) => {
                    let dateTo = new Date(a.date);
                    let dateFrom = new Date(b.date);
                    if (dateTo > dateFrom) return 1;
                    if (dateTo < dateFrom) return -1;

                    return 0;
                })
                callback();
            }
        } catch (e) {
            return console.log(e);
        }
    }

    static async getFilterTools(callbackShow) {
        let res = await fetch('/templates/filter-tools.html').then(response => response.text())
        let div = $("<div>").html(res);
        $('#filter-tools').append(div);
        new FilterTools(callbackShow);
    }
}