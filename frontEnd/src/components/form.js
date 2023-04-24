import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
    constructor(page) {
        this.rememberElement = null
        this.repeatPasswordField = null
        this.processElement = null;
        this.page = page;

        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/main';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                messageError: 'Недопустимый email',
                load: () => {
                },
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                messageError: 'Пароль должен содержать от 8 до 32 символов, включать хотя бы одну заглавную латинскую букву, одну строчную и одну цифру',
                load: () => {
                    if (this.page === 'signup' && this.repeatPasswordField.element.value !== '') {
                        this.checkPassword();
                    }
                },
                valid: false
            }
        ];
        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s+[А-Я][а-я]+\s*[А-Я][а-я]+\s*$/,
                    messageError: 'Укажите полное имя с заглавной буквы',
                    load: () => {
                    },
                    valid: false
                },
                {
                    name: 'repeatPassword',
                    id: 'repeat-password',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    messageError: 'Пароли должны совпадать',
                    load: () => {
                        this.checkPassword();
                    },
                    valid: false
                }
            );
        }

        const that = this;
        this.repeatPasswordField = this.fields.find(item => item.name === 'repeatPassword');

        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateFields.call(that, item, this)
            }
        });
        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        }
        //
        if (this.page === 'login') {
            this.rememberElement = document.getElementById('remember');
        }
    }

    validateFields(field, element) {
        this.setStyleValidate(!element.value || !element.value.match(field.regex), field, element);
        field.load();

        this.validateForm();
    }

    setStyleValidate(condition, field, element) {
        if (condition) {
            element.classList.add('border-danger');
            element.nextElementSibling.innerText = field.messageError;
            field.valid = false;
        } else {
            element.classList.remove('border-danger');
            element.nextElementSibling.innerText = '';
            field.valid = true;
        }
    }

    checkPassword() {
        let passwordField = this.fields.find(item => item.name === 'password');
        this.setStyleValidate(passwordField.element.value !== this.repeatPasswordField.element.value, this.repeatPasswordField, this.repeatPasswordField.element);
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        if (validForm) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return validForm;
    }

    parseName(fullName) {
        return fullName.split(' ').filter(item => item !== '');
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                try {
                    let [name, lastName] = this.parseName(this.fields.find(item => item.name === 'name').element.value);
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'repeatPassword').element.value
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (e) {
                    return console.log(e)
                }
            }
            //авторизация
            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                    rememberMe: this.rememberElement ? this.rememberElement.checked : false
                });

                if (result) {
                    if (result.error || result.status === 401) {
                        document.getElementById('invalid-field').innerText = 'Неправильная почта или пароль';
                        return;
                    } else if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken
                        || !result.user.name || !result.user.lastName || !result.user.id) {
                        throw new Error(result.message);
                    }

                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        name: result.user.name,
                        lastName: result.user.lastName,
                        userId: result.user.id
                    })

                    localStorage.setItem('email', email);
                    if (localStorage.getItem('redirect')) {
                        location.href = localStorage.getItem('redirect');
                        localStorage.removeItem('redirect');
                    } else {
                        location.href = '#/main';
                    }

                }
            } catch (e) {
                console.log(e)
            }
        }
    }
}