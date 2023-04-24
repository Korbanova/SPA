import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class CreateCategory {
    constructor(nameCategory, page) {
        this.titleCategoryElement = document.getElementById('name');
        this.titleEdit = '';
        this.nameCategory = nameCategory;
        this.idCategory = localStorage.getItem('category-' + this.nameCategory);
        const that = this;

        document.getElementById('categories').classList.add('active');
        document.getElementById(this.nameCategory).classList.add('active');
        document.getElementById('sidebar-categories').classList.remove('open');
        document.getElementById('cansel').onclick = function (e) {
            location.href = '#/' + that.nameCategory;
        };
        if (page === 'create') {

            document.getElementById('create').onclick = function (e) {
                that.createCategory();
            };
        } else {
            this.titleCategoryElement.onchange = function () {
                this.classList.remove('border-danger');
            }
            this.getTitleCategory();
            document.getElementById('save').onclick = function (e) {
                that.updateCategory();
            };
        }
    }

    async createCategory() {
        if (this.titleCategoryElement.value) {
            try {
                const result = await CustomHttp.request(config.host + '/categories/' + this.nameCategory, 'POST', {
                    title: this.titleCategoryElement.value
                });

                if (result) {
                    if (result.error) {
                        this.titleCategoryElement.classList.add('border-danger');
                        this.titleCategoryElement.nextElementSibling.innerText = result.message;
                        return;
                    }
                    this.categories = result;
                    location.href = '#/' + this.nameCategory;
                }
            } catch (e) {
                return console.log(e);
            }
        } else {
            this.titleCategoryElement.classList.add('border-danger');
        }
    }

    async getTitleCategory() {
        if (this.idCategory) {
            try {
                const result = await CustomHttp.request(config.host + `/categories/${this.nameCategory}/` + this.idCategory);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.titleEdit = result.title;
                    this.titleCategoryElement.value = result.title;
                }
            } catch (e) {
                return console.log(e);
            }
        }
    }

    async updateCategory() {
        let name = this.titleCategoryElement.value.trim();

        if (name && name !== this.titleEdit && this.idCategory) {
            try {
                const result = await CustomHttp.request(config.host + `/categories/${this.nameCategory}/` + this.idCategory, 'PUT', {
                    title: name
                });

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.categories = result;
                    location.href = '#/' + this.nameCategory;
                }
            } catch (e) {
                return console.log(e);
            }
        } else {
            this.titleCategoryElement.classList.add('border-danger');
        }
    }


}
