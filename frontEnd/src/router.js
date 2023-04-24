import {Auth} from "./services/auth.js";
import {Form} from "./components/form.js";
import {Main} from "./components/main.js";
import {IncomeExpense} from "./components/incomeExpense.js";
import {Sidebar} from "./components/sidebar.js";
import {Category} from "./components/category.js";
import {CreateIncomeAndExpense} from "./components/createIncomeAndExpense.js";
import {CreateCategory} from "./components/createCategory.js";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('app');
        this.titleElement = document.getElementById('title-page');

        this.routes = [
            {
                route: '#/',
                title: 'Вход в систему',
                template: '/templates/login.html',
                needAccessToken: false,
                sidebar: false,
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: '/templates/signup.html',
                needAccessToken: false,
                sidebar: false,
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: '/templates/main.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/incomeExpense',
                title: 'Доходы и расходы',
                template: '/templates/income-expense.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new IncomeExpense();
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: '/templates/income.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new Category('income');
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: '/templates/expense.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new Category('expense');
                }
            },
            {
                route: '#/create-income-expense',
                title: 'Создание дохода/расхода',
                template: '/templates/create-income-expense.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new CreateIncomeAndExpense('create');
                }
            },
            {
                route: '#/edit-income-expense',
                title: 'Редактирование дохода/расхода',
                template: '/templates/edit-income-expense.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new CreateIncomeAndExpense('edit');
                }
            },
            {
                route: '#/create-category-income',
                title: 'Создание категории доходов',
                template: '/templates/create-category-income.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new CreateCategory('income', 'create');
                }
            },
            {
                route: '#/edit-category-income',
                title: 'Редактирование категории доходов',
                template: '/templates/edit-category-income.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new CreateCategory('income', 'edit');
                }
            },
            {
                route: '#/create-category-expense',
                title: 'Создание категории расходов',
                template: '/templates/create-category-expense.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new CreateCategory('expense', 'create');
                }
            },
            {
                route: '#/edit-category-expense',
                title: 'Редактирование категории расходов',
                template: '/templates/edit-category-expense.html',
                needAccessToken: true,
                sidebar: '/templates/sidebar.html',
                load: () => {
                    new CreateCategory('expense', 'edit');
                }
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0];
        const accessToken = localStorage.getItem(Auth.accessTokenKey);

        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/';
            return;
        }

        const newRoute = this.routes.find(item => item.route === urlRoute)

        if (!newRoute ) {
            window.location.href = '#/';
            return;
        }
        if (!accessToken && newRoute.needAccessToken) {
            localStorage.setItem('redirect', urlRoute);
            window.location.href = '#/';
            return;
        }


        if (newRoute.sidebar) {
            if (document.getElementById('sidebar')) {
                document.getElementById('container').innerHTML = await fetch(newRoute.template).then(response => response.text());
            } else {
                this.contentElement.innerHTML = `<div class="d-flex vh-100">
                                                    ${await fetch(newRoute.sidebar).then(response => response.text())}
                                                    <div class="container flex-grow-1" id="container">
                                                        ${await fetch(newRoute.template).then(response => response.text())}
                                                    </div>
                                                 </div>`;
                new Sidebar();
            }
        } else {
            this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        }

        this.titleElement.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo();
        let userElement = document.getElementById('userFullName');

        if (userElement && userInfo && accessToken) {
            let fullName = userInfo.name + ' ' + userInfo.lastName;
            userElement.innerText = fullName.substring(0, 14) + '...';
            await Sidebar.setBalance();
        }
        newRoute.load();
    }
}