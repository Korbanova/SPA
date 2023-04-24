export class CreateSpecialElement {
    static createCalendar() {
        $('#search-from-date').daterangepicker({
            autoUpdateInput: false,
            parentEl: '#search-interval',
            singleDatePicker: true,
            locale: {
                cancelLabel: 'Clear'
            }
        });
        $('#search-to-date').daterangepicker({
            autoUpdateInput: false,
            parentEl: '#search-interval',
            singleDatePicker: true,
            locale: {
                cancelLabel: 'Clear'
            },
            useCurrent: false //Important! See issue #1075
        });

        $('#search-from-date').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD.MM.YYYY'));
            if ($('#search-to-date').data('daterangepicker')) {
                $('#search-to-date').data('daterangepicker').minDate = picker.startDate;
            }
        });

        $('#search-to-date').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD.MM.YYYY'));
            $('#search-from-date').data('daterangepicker').maxDate = picker.startDate;
        });

        $('#search-from-date, #search-to-date').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });
    }

    static convertToFormatDate(date, formatFrom, separateFrom, formatTo = 'YYYYMMDD', separateTo = '-') {
        let year, month, day;
        switch (formatFrom) {
            case 'DDMMYYYY':
                [day, month, year] = date.split(separateFrom);
                break;
            case 'YYYYMMDD':
                [year, month, day] = date.split(separateFrom);
                break;
            default:
                [year, month, day] = date.split(separateFrom);
                break;
        }
        switch (formatTo) {
            case 'YYYYMMDD':
                return year + separateTo + month + separateTo + day;
            case 'DDMMYYYY':
                return day + separateTo + month + separateTo + year;
        }
    }
}