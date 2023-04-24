import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Sidebar {

    constructor() {
        this.init();
    }

    init() {
        $('#categories').click(function (e) {
            $(this).parent().toggleClass('open');

        })
        $('#sidebarMenu').children().on('click', function (e) {
            if ($(this).hasClass('sidebar-item')) {
                $('#sidebar-categories').removeClass('open');
                $('#categories-menu').find('a.active').removeClass('active');
            }
            $('a.active').first().removeClass('active'); // здесь нужно удалить только у эл-в на одном уровне вложенности
            $(this).children(":first").addClass('active')
        });

        $('#categories-menu').children().on('click', function (e) {
            $('.dropdown-item').removeClass('active')
            $(this).children(":first").addClass('active');
            $('#sidebar-categories').removeClass('open');
        })
        $('#currency').text(config.currency);
    }

    static async setBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
            }
            document.getElementById('balance').innerText = result.balance;
        } catch (e) {
            return console.log(e)
        }
    }
}
