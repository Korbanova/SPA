import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Popup} from "./popup.js";
import {FilterTools} from "./filterTools.js";
import {IncomeExpense} from "./incomeExpense.js";

export class Category {
    constructor(nameCategory) {
        this.nameCategory = nameCategory;
        this.categories = [];
        this.categoriesElement = document.getElementById('categories-items');
        this.titleCategoty = '';

        document.getElementById('categories').classList.add('active');
        document.getElementById(this.nameCategory).classList.add('active');

        this.init();
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + this.nameCategory);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;
                this.showCategory();
                const that = this;

                Popup.getPopup(`Вы действительно хотите удалить категорию? Связанные ${this.nameCategory === 'expense' ? 'расходы' : 'доходы'} будут удалены навсегда.`);

                document.getElementById('create-category').onclick = function (e) {
                    location.href = '#/create-category-' + that.nameCategory;
                }

                $('.edit-category').click(function (e) {
                    localStorage.setItem('category-' + that.nameCategory, e.target.id.split('-').pop());
                    location.href = '#/edit-category-' + that.nameCategory;
                })

                $('.delete-category').click(function (e) {
                    Popup.showPopup();
                    let id = e.target.id.split('-').pop();
                    that.titleCategoty = document.getElementById('name-' + id).innerText;
                    Popup.addEventDelete(id, that.callbackDeleteCategory.bind(that));
                })
            }
        } catch (e) {
            return console.log(e);
        }
    }

    showCategory() {
        let addElement = this.categoriesElement.innerHTML;
        this.categoriesElement.innerHTML = '';

        this.categories.forEach(item => {
            let category = `<div class="col">
                                <div class="card rounded-4">
                                    <div class="card-body p-3">
                                        <h3 id="name-${item.id}" class="mb-2 name-category">${item.title}</h3>
                                        <button id="edit-${item.id}" class="btn btn-primary px-3 py-2 me-2 edit-category">Редактировать</button>
                                        <button id="delete-${item.id}" class="btn btn-danger px-3 py-2 delete-category">Удалить</button>
                                    </div>
                                </div>
                            </div>`;

            this.categoriesElement.innerHTML += category;
        })
        this.categoriesElement.innerHTML += addElement;
    }

    async callbackDeleteCategory(id) {
        await FilterTools.filterOperations('all', this.deleteOptionForCategory.bind(this));

        try {
            const result = await CustomHttp.request(config.host + `/categories/${this.nameCategory}/` + id, 'DELETE');

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.reload()
            }

        } catch (e) {
            return console.log(e);
        }
    }

    deleteOptionForCategory() {
        FilterTools.operations.forEach(operation => {
            if (operation.category === this.titleCategoty) {
                IncomeExpense.deleteOperation(operation.id);
            }
        })
    }
}
